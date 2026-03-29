import { generatePKCEPair, generateCodeChallenge } from "../lib/crypto/pkce";
import { generateDPoPProof } from "../lib/crypto/dpop";
import type {
  AuthorizationRequestConfig,
  AuthorizationResponse,
  TokenResponse,
  TokenErrorResponse,
} from "../lib/oidc";
import type { ClientConfig } from "../lib/storage/client-config";

export { generatePKCEPair };

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate a random nonce for replay attack prevention
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Build authorization URL from request parameters
 */
export async function buildAuthorizationUrl(
  authorizationEndpoint: string,
  clientId: string,
  redirectUri: string,
  request: AuthorizationRequestConfig,
): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: request.response_type,
    scope: request.scope,
  });

  if (request.state) {
    params.append("state", request.state);
  }
  if (request.nonce) {
    params.append("nonce", request.nonce);
  }
  if (request.code_verifier) {
    const challenge = await generateCodeChallenge(request.code_verifier);
    params.append("code_challenge", challenge);
    params.append("code_challenge_method", "S256");
  }
  if (request.response_mode) {
    params.append("response_mode", request.response_mode);
  }
  if (request.display) {
    params.append("display", request.display);
  }
  if (request.prompt) {
    params.append("prompt", request.prompt);
  }
  if (request.max_age !== undefined) {
    params.append("max_age", String(request.max_age));
  }
  if (request.ui_locales) {
    params.append("ui_locales", request.ui_locales);
  }
  if (request.id_token_hint) {
    params.append("id_token_hint", request.id_token_hint);
  }
  if (request.login_hint) {
    params.append("login_hint", request.login_hint);
  }
  if (request.acr_values) {
    params.append("acr_values", request.acr_values);
  }
  if (request.resource) {
    const resources = Array.isArray(request.resource) ? request.resource : [request.resource];
    for (const r of resources) {
      params.append("resource", r);
    }
  }
  if (request.customParams) {
    Object.entries(request.customParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }

  return `${authorizationEndpoint}?${params.toString()}`;
}

/**
 * Open authorization popup and wait for callback
 */
export function openAuthorizationPopup(authorizationUrl: string): Window | null {
  const width = 500;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  return window.open(
    authorizationUrl,
    "oauth_authorization",
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
  );
}

export function waitForAuthorizationCallback(popup: Window): Promise<AuthorizationResponse> {
  return new Promise((resolve, reject) => {
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data && event.data.type === "oauth_callback") {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        popup.close();
        const callbackData: AuthorizationResponse = {
          code: event.data.code,
          state: event.data.state,
          error: event.data.error,
          error_description: event.data.error_description,
        };
        if (callbackData.error) {
          reject(new Error(callbackData.error_description || callbackData.error));
        } else {
          resolve(callbackData);
        }
      }
    };

    window.addEventListener("message", messageHandler);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        reject(new Error("Authorization was cancelled"));
      }
    }, 500);
  });
}

/**
 * Build form body and auth headers for token endpoint request.
 * Client auth credentials are assembled here (not on the server).
 */
export function buildTokenRequest(
  client: ClientConfig,
  params: Record<string, string | undefined>,
): { headers: Record<string, string>; body: string } {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      form.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (client.clientAuthenticationMethod === "client_secret_basic" && client.clientSecret) {
    // RFC 6749 §2.3.1: encode client_id and client_secret per application/x-www-form-urlencoded
    const credentials = `${encodeURIComponent(client.clientId)}:${encodeURIComponent(client.clientSecret)}`;
    headers["Authorization"] = `Basic ${btoa(credentials)}`;
  } else {
    form.set("client_id", client.clientId);
    if (client.clientAuthenticationMethod === "client_secret_post" && client.clientSecret) {
      form.set("client_secret", client.clientSecret);
    }
  }

  return { headers, body: form.toString() };
}

/**
 * Build a curl command string for the token request (for display purposes).
 */
export function buildTokenCurlCommand(
  tokenEndpoint: string,
  client: ClientConfig,
  params: Record<string, string | undefined>,
): string {
  const { headers, body } = buildTokenRequest(client, params);
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `  -H '${k}: ${v}'`)
    .join(" \\\n");
  return `curl -X POST '${tokenEndpoint}' \\\n${headerLines} \\\n  -d '${body}'`;
}

/**
 * Send a token request.
 * - private_key_jwt: routed through /api/token-exchange (server generates JWT assertion)
 * - all others: routed through /api/token-proxy; DPoP proof added client-side if enabled
 */
async function sendTokenRequest(
  tokenEndpoint: string,
  client: ClientConfig,
  params: Record<string, string | undefined>,
): Promise<TokenResponse | TokenErrorResponse> {
  try {
    if (client.clientAuthenticationMethod === "private_key_jwt") {
      let dpopProof: string | undefined;
      if (client.dpop && client.dpopPrivateKeyJwk && client.dpopPublicKeyJwk) {
        dpopProof = await generateDPoPProof(
          JSON.parse(client.dpopPrivateKeyJwk) as JsonWebKey,
          JSON.parse(client.dpopPublicKeyJwk) as JsonWebKey,
          "POST",
          tokenEndpoint,
        );
      }
      const tokenRequest: Record<string, string | string[] | undefined> = {};
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") tokenRequest[k] = v;
      }
      const response = await fetch("/api/token-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenEndpoint, client, tokenRequest, dpopProof }),
      });
      const data = (await response.json()) as Record<string, unknown>;
      if (!response.ok || data["error"]) {
        return data as unknown as TokenErrorResponse;
      }
      return data as unknown as TokenResponse;
    }

    // All other auth methods: build request client-side and proxy
    const { headers, body } = buildTokenRequest(client, params);
    if (client.dpop && client.dpopPrivateKeyJwk && client.dpopPublicKeyJwk) {
      const dpopProof = await generateDPoPProof(
        JSON.parse(client.dpopPrivateKeyJwk) as JsonWebKey,
        JSON.parse(client.dpopPublicKeyJwk) as JsonWebKey,
        "POST",
        tokenEndpoint,
      );
      headers["DPoP"] = dpopProof;
    }
    const response = await fetch("/api/token-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenEndpoint, headers, body }),
    });
    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok || data["error"]) {
      return data as unknown as TokenErrorResponse;
    }
    return data as unknown as TokenResponse;
  } catch (error) {
    return {
      error: "network_error",
      error_description: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForToken(
  tokenEndpoint: string,
  client: ClientConfig,
  code: string,
  redirectUri: string,
  codeVerifier?: string,
): Promise<TokenResponse | TokenErrorResponse> {
  return sendTokenRequest(tokenEndpoint, client, {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
}

/**
 * Request tokens using client credentials flow
 */
export async function requestClientCredentialsToken(
  tokenEndpoint: string,
  client: ClientConfig,
  scope?: string,
  resource?: string | string[],
): Promise<TokenResponse | TokenErrorResponse> {
  return sendTokenRequest(tokenEndpoint, client, {
    grant_type: "client_credentials",
    scope,
    resource: Array.isArray(resource) ? resource.join(" ") : resource,
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  tokenEndpoint: string,
  client: ClientConfig,
  refreshToken: string,
  scope?: string,
): Promise<TokenResponse | TokenErrorResponse> {
  return sendTokenRequest(tokenEndpoint, client, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope,
  });
}

/**
 * Build a curl command string for the UserInfo request (for display purposes).
 */
export function buildUserinfoCurlCommand(
  userinfoEndpoint: string,
  accessToken: string,
  dpop: boolean,
): string {
  const lines = [
    `curl -X GET '${userinfoEndpoint}'`,
    `  -H 'Authorization: Bearer ${accessToken}'`,
  ];
  if (dpop) {
    lines.push(`  -H 'DPoP: <proof>'`);
  }
  return lines.join(" \\\n");
}

/**
 * Call the UserInfo endpoint with the given access token.
 * Routes through the server to avoid CORS. Generates a DPoP proof if the client has DPoP enabled.
 */
export async function callUserinfo(
  userinfoEndpoint: string,
  accessToken: string,
  client: ClientConfig,
): Promise<Record<string, unknown>> {
  let dpopProof: string | undefined;
  if (client.dpop && client.dpopPrivateKeyJwk && client.dpopPublicKeyJwk) {
    dpopProof = await generateDPoPProof(
      JSON.parse(client.dpopPrivateKeyJwk) as JsonWebKey,
      JSON.parse(client.dpopPublicKeyJwk) as JsonWebKey,
      "GET",
      userinfoEndpoint,
    );
  }
  const response = await fetch("/api/userinfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userinfoEndpoint, accessToken, dpopProof }),
  });
  return response.json() as Promise<Record<string, unknown>>;
}

/**
 * Build end-session (logout) URL per RP-Initiated Logout 1.0 spec.
 */
export function buildEndSessionUrl(
  endSessionEndpoint: string,
  params: {
    id_token_hint?: string;
    logout_hint?: string;
    client_id?: string;
    post_logout_redirect_uri?: string;
    state?: string;
    ui_locales?: string;
  },
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `${endSessionEndpoint}?${qs}` : endSessionEndpoint;
}
