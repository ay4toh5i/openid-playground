import type { ClientAuthMethod } from "./flowTypes.ts";

export type AuthForm = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  state: string;
  nonce: string;
  prompt: string;
  usePkce: boolean;
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  code: string;
  clientSecret: string;
  authMethod: ClientAuthMethod;
  clientAssertion: string;
};

export type ClientCredentialsForm = {
  tokenEndpoint: string;
  scope: string;
  audience: string;
  clientId: string;
  clientSecret: string;
  authMethod: ClientAuthMethod;
  clientAssertion: string;
};

export type RefreshForm = {
  tokenEndpoint: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  authMethod: ClientAuthMethod;
  clientAssertion: string;
};

export type UserinfoForm = {
  userinfoEndpoint: string;
  accessToken: string;
};

export type LogoutForm = {
  endSessionEndpoint: string;
  idTokenHint: string;
  postLogoutRedirectUri: string;
  state: string;
};

export type RevokeForm = {
  revokeEndpoint: string;
  token: string;
  tokenTypeHint: string;
  clientId: string;
  clientSecret: string;
  authMethod: ClientAuthMethod;
  clientAssertion: string;
};
