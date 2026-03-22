/**
 * Shared types for OAuth/OIDC flow state management
 */

export type FlowType = "authorization_code" | "client_credentials" | "refresh_token";

export interface PKCEState {
  verifier: string;
  challenge: string;
  method: "S256" | "plain";
}

export interface AuthorizationRequestData {
  // Required parameters
  scope: string;
  response_type: string;
  state: string;

  // OIDC parameters
  nonce?: string;

  // PKCE parameters
  code_challenge?: string;
  code_challenge_method?: "S256" | "plain";

  // Optional parameters
  response_mode?: "query" | "fragment" | "form_post" | string;
  display?: "page" | "popup" | "touch" | "wap";
  prompt?: string;
  max_age?: number;
  ui_locales?: string;
  id_token_hint?: string;
  login_hint?: string;
  acr_values?: string;
  resource?: string;

  // Custom parameters
  customParams?: Record<string, string>;
}

export interface AuthorizationCallbackData {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface TokenResponseData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface TokenErrorData {
  error: string;
  error_description?: string;
  error_uri?: string;
}
