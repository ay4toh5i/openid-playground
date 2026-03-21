import { createRoute } from "honox/factory";
import type { TokenResponse } from "../../../lib/oauth/types";

interface TokenRequestBody {
  tokenEndpoint: string;
  grantType: "authorization_code" | "client_credentials";
  clientId: string;
  clientSecret?: string;
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
  scopes?: string[];
  resources?: string[];
  additionalParams?: Record<string, string>;
}

export const POST = createRoute(async (c) => {
  let body: TokenRequestBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const {
    tokenEndpoint,
    grantType,
    clientId,
    clientSecret,
    code,
    redirectUri,
    codeVerifier,
    scopes,
    resources,
    additionalParams,
  } = body;

  if (!tokenEndpoint || !grantType || !clientId) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  if (grantType === "authorization_code" && (!code || !redirectUri)) {
    return c.json({ error: "Authorization code flow requires code and redirect_uri" }, 400);
  }

  try {
    const params = new URLSearchParams();
    params.set("grant_type", grantType);
    params.set("client_id", clientId);

    if (grantType === "authorization_code") {
      params.set("code", code!);
      params.set("redirect_uri", redirectUri!);
      if (codeVerifier) {
        params.set("code_verifier", codeVerifier);
      }
    }

    if (grantType === "client_credentials" && scopes && scopes.length > 0) {
      params.set("scope", scopes.join(" "));
    }

    if (resources && resources.length > 0) {
      for (const resource of resources) {
        params.append("resource", resource);
      }
    }

    if (additionalParams) {
      for (const [key, value] of Object.entries(additionalParams)) {
        if (key && value) {
          params.set(key, value);
        }
      }
    }

    // Add client_secret for confidential clients using client_secret_post
    if (clientSecret) {
      params.set("client_secret", clientSecret);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // For confidential clients, also support Basic auth
    // The server will accept either method
    if (clientSecret) {
      const credentials = btoa(`${clientId}:${clientSecret}`);
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body: params.toString(),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const responseData = isJson ? await response.json() : await response.text();

    if (!isJson) {
      return c.json(
        {
          error: "Token endpoint returned non-JSON response",
          error_description:
            typeof responseData === "string" ? responseData.slice(0, 1000) : undefined,
        },
        response.status as 400 | 401 | 500,
      );
    }

    const meta = {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };

    if (!response.ok) {
      return c.json(
        {
          error: responseData.error || "Token request failed",
          error_description: responseData.error_description,
          _meta: meta,
        },
        response.status as 400 | 401 | 500,
      );
    }

    return c.json({ ...(responseData as TokenResponse), _meta: meta });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: `Token request failed: ${message}` }, 500);
  }
});
