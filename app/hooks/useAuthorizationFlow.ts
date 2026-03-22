/**
 * Authorization flow operations - pure functions for OAuth/OIDC flows
 * Client assembles the full token request; server only proxies to token endpoint.
 */
import { generatePKCEPair } from "../lib/crypto/pkce";
import type {
  AuthorizationRequestData,
  AuthorizationCallbackData,
  TokenResponseData,
  TokenErrorData,
} from "../lib/flow-types";
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
export function buildAuthorizationUrl(
  authorizationEndpoint: string,
  clientId: string,
  redirectUri: string,
  request: AuthorizationRequestData
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: request.response_type,
    scope: request.scope,
  });

  if (request.state) params.append("state", request.state);
  if (request.nonce) params.append("nonce", request.nonce);
  if (request.code_challenge) params.append("code_challenge", request.code_challenge);
  if (request.code_challenge_method) params.append("code_challenge_method", request.code_challenge_method);
  if (request.response_mode) params.append("response_mode", request.response_mode);
  if (request.display) params.append("display", request.display);
  if (request.prompt) params.append("prompt", request.prompt);
  if (request.max_age !== undefined) params.append("max_age", String(request.max_age));
  if (request.ui_locales) params.append("ui_locales", request.ui_locales);
  if (request.id_token_hint) params.append("id_token_hint", request.id_token_hint);
  if (request.login_hint) params.append("login_hint", request.login_hint);
  if (request.acr_values) params.append("acr_values", request.acr_values);
  if (request.resource) params.append("resource", request.resource);
  if (request.customParams) {
    Object.entries(request.customParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  return `${authorizationEndpoint}?${params.toString()}`;
}

/**
 * Open authorization popup and wait for callback
 */
export async function startAuthorizationRequest(
  authorizationUrl: string
): Promise<AuthorizationCallbackData> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authorizationUrl,
      "oauth_authorization",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Popup was blocked. Please allow popups for this site."));
      return;
    }

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "oauth_callback") {
        window.removeEventListener("message", messageHandler);
        popup.close();
        const callbackData: AuthorizationCallbackData = {
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
function buildTokenRequest(
  client: ClientConfig,
  params: Record<string, string | undefined>
): { headers: Record<string, string>; body: string } {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") form.set(key, value);
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
 * Send a pre-built token request through the server proxy.
 * Server only forwards; all auth assembly is done client-side.
 */
async function proxyTokenRequest(
  tokenEndpoint: string,
  client: ClientConfig,
  params: Record<string, string | undefined>
): Promise<TokenResponseData | TokenErrorData> {
  try {
    const { headers, body } = buildTokenRequest(client, params);
    const response = await fetch("/api/token-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenEndpoint, headers, body }),
    });
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || data["error"]) {
      return data as unknown as TokenErrorData;
    }
    return data as unknown as TokenResponseData;
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
  codeVerifier?: string
): Promise<TokenResponseData | TokenErrorData> {
  return proxyTokenRequest(tokenEndpoint, client, {
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
  resource?: string | string[]
): Promise<TokenResponseData | TokenErrorData> {
  return proxyTokenRequest(tokenEndpoint, client, {
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
  scope?: string
): Promise<TokenResponseData | TokenErrorData> {
  return proxyTokenRequest(tokenEndpoint, client, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope,
  });
}
