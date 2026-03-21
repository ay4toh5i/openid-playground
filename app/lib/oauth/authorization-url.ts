import type { PKCEMethod } from "./types";

export interface AuthorizationUrlParams {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  responseType?: string;
  // PKCE
  codeChallenge?: string;
  codeChallengeMethod?: PKCEMethod;
  // OpenID specific
  nonce?: string;
  prompt?: "none" | "login" | "consent" | "select_account";
  loginHint?: string;
  acrValues?: string;
  uiLocales?: string;
  // Additional parameters
  additionalParams?: Record<string, string>;
  // Resource Indicators (RFC 8707)
  resources?: string[];
}

export function buildAuthorizationUrl(params: AuthorizationUrlParams): string {
  const url = new URL(params.authorizationEndpoint);

  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", params.responseType || "code");
  url.searchParams.set("state", params.state);

  if (params.scopes.length > 0) {
    url.searchParams.set("scope", params.scopes.join(" "));
  }

  // PKCE parameters
  if (params.codeChallenge) {
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", params.codeChallengeMethod || "S256");
  }

  // OpenID specific parameters
  if (params.nonce) {
    url.searchParams.set("nonce", params.nonce);
  }

  if (params.prompt) {
    url.searchParams.set("prompt", params.prompt);
  }

  if (params.loginHint) {
    url.searchParams.set("login_hint", params.loginHint);
  }

  if (params.acrValues) {
    url.searchParams.set("acr_values", params.acrValues);
  }

  if (params.uiLocales) {
    url.searchParams.set("ui_locales", params.uiLocales);
  }

  if (params.resources && params.resources.length > 0) {
    for (const resource of params.resources) {
      url.searchParams.append("resource", resource);
    }
  }

  // Additional parameters
  if (params.additionalParams) {
    for (const [key, value] of Object.entries(params.additionalParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function getRedirectUri(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}/callback`;
}
