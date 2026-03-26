import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ClientConfig } from "../../lib/storage/client-config";

type TokenRequest = {
  grant_type: "authorization_code" | "refresh_token" | "client_credentials";
  code?: string;
  redirect_uri?: string;
  code_verifier?: string;
  refresh_token?: string;
  scope?: string;
  resource?: string | string[];
};

interface TokenExchangeRequest {
  tokenEndpoint: string;
  client: ClientConfig;
  tokenRequest: TokenRequest;
  dpopProof?: string;
}

const app = new Hono();

/**
 * Generate client assertion JWT for private_key_jwt authentication.
 * Prefers EC P-256 / ES256 via JWK; falls back to RS256 via PEM for backward compatibility.
 */
async function generateClientAssertion(
  clientId: string,
  tokenEndpoint: string,
  privateKeyJwk: string,
): Promise<string> {
  try {
    const { importJWK, SignJWT: JoseSignJWT } = await import("jose");
    type JWK = Parameters<typeof importJWK>[0];

    const privateKey = await importJWK(JSON.parse(privateKeyJwk) as JWK, "ES256");

    return new JoseSignJWT({
      iss: clientId,
      sub: clientId,
      aud: tokenEndpoint,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
  } catch (error) {
    console.error("Failed to generate client assertion:", error);
    throw new Error(
      `Failed to generate client assertion: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

app.post("/", async (c) => {
  try {
    const body = await c.req.json<TokenExchangeRequest>();
    const { tokenEndpoint, client, tokenRequest, dpopProof } = body;

    if (!tokenEndpoint || !client || !tokenRequest) {
      return c.json(
        {
          error: "invalid_request",
          error_description: "Missing required parameters",
        },
        400,
      );
    }

    // Build form body
    const formBody = new URLSearchParams();

    // Add grant-specific parameters
    Object.entries(tokenRequest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => formBody.append(key, String(v)));
        } else {
          formBody.append(key, String(value));
        }
      }
    });

    // Prepare headers
    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    });

    // Handle client authentication
    switch (client.clientAuthenticationMethod) {
      case "client_secret_basic": {
        if (!client.clientSecret) {
          return c.json(
            {
              error: "invalid_client",
              error_description: "Client secret is required for client_secret_basic",
            },
            400,
          );
        }
        const credentials = btoa(`${client.clientId}:${client.clientSecret}`);
        headers.set("Authorization", `Basic ${credentials}`);
        break;
      }

      case "client_secret_post": {
        if (!client.clientSecret) {
          return c.json(
            {
              error: "invalid_client",
              error_description: "Client secret is required for client_secret_post",
            },
            400,
          );
        }
        formBody.append("client_id", client.clientId);
        formBody.append("client_secret", client.clientSecret);
        break;
      }

      case "private_key_jwt": {
        if (!client.privateKeyJwk) {
          return c.json(
            {
              error: "invalid_client",
              error_description: "Private key is required for private_key_jwt",
            },
            400,
          );
        }
        try {
          const assertion = await generateClientAssertion(
            client.clientId,
            tokenEndpoint,
            client.privateKeyJwk,
          );
          formBody.append("client_assertion", assertion);
          formBody.append(
            "client_assertion_type",
            "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
          );
        } catch {
          return c.json(
            {
              error: "invalid_client",
              error_description: "Failed to generate client assertion",
            },
            400,
          );
        }
        break;
      }

      case "none": {
        formBody.append("client_id", client.clientId);
        break;
      }

      default:
        return c.json(
          {
            error: "invalid_client",
            error_description: "Unsupported client authentication method",
          },
          400,
        );
    }

    // Add DPoP proof header if provided
    if (dpopProof) {
      headers.set("DPoP", dpopProof);
    }

    // Make the token request
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body: formBody.toString(),
    });

    const data = await response.json();

    // Return the token response (or error) with the same status code
    return c.json(data, response.status as ContentfulStatusCode);
  } catch (error) {
    console.error("Token exchange error:", error);
    return c.json(
      {
        error: "server_error",
        error_description: error instanceof Error ? error.message : "Internal server error",
      },
      500,
    );
  }
});

export default app;
