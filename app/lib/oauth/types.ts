// OpenID Connect Discovery Document
export interface OpenIDConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  grant_types_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  code_challenge_methods_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  claims_supported?: string[];
  acr_values_supported?: string[];
  ui_locales_supported?: string[];
}

// Issuer information with cached well-known data
export interface Issuer {
  id: string;
  name: string;
  issuer: string; // issuer URL
  wellKnown: OpenIDConfiguration;
  createdAt: number;
  updatedAt: number;
}

// OAuth client bound to an issuer
export interface OAuthClient {
  id: string;
  name: string;
  issuerId: string;
  clientId: string;
  clientSecret?: string;
}

// Token response from OAuth server
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

// Authorization Code Flow state
export interface AuthCodeFlowState {
  client: OAuthClient | null;
  scopes: string[];
  usePKCE: boolean;
  codeVerifier?: string;
  codeChallenge?: string;
  nonce?: string;
  state?: string;
  acrValues?: string;
  locale?: string;
  prompt?: "none" | "login" | "consent" | "select_account";
  loginHint?: string;
  authorizationCode?: string;
  tokenResponse?: TokenResponse;
}

// Client Credentials Flow state
export interface ClientCredentialsFlowState {
  client: OAuthClient | null;
  scopes: string[];
  tokenResponse?: TokenResponse;
}

// PKCE challenge methods
export type PKCEMethod = "S256" | "plain";

// Token endpoint authentication methods
export type TokenEndpointAuthMethod = "client_secret_basic" | "client_secret_post" | "none";
