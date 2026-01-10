export type ClientAuthMethod =
  | "client_secret_post"
  | "client_secret_basic"
  | "private_key_jwt"
  | "none";

export type ClientKind = "confidential" | "public";

export type Client = {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authMethod: ClientAuthMethod;
  kind: ClientKind;
};

export type RequestResult = {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  body: string;
  error?: string;
};

export type JwtView = {
  header?: string;
  payload?: string;
  error?: string;
};

export type FlowId =
  | "code"
  | "client_credentials"
  | "refresh"
  | "userinfo"
  | "logout"
  | "revoke";

export const storageKey = "oidc-playground.clients.v1";

export const defaultClient: Client = {
  id: "",
  name: "",
  clientId: "",
  clientSecret: "",
  redirectUri: "",
  authMethod: "client_secret_basic",
  kind: "confidential",
};

export const clientAuthOptions: { value: ClientAuthMethod; label: string }[] = [
  { value: "client_secret_basic", label: "client_secret_basic" },
  { value: "client_secret_post", label: "client_secret_post" },
  { value: "private_key_jwt", label: "private_key_jwt" },
  { value: "none", label: "none" },
];

export const flowTabs: { id: FlowId; label: string; pill?: string }[] = [
  { id: "code", label: "Code Flow", pill: "OIDC" },
  { id: "client_credentials", label: "Client Credentials" },
  { id: "refresh", label: "Refresh Token" },
  { id: "userinfo", label: "Userinfo" },
  { id: "logout", label: "Logout" },
  { id: "revoke", label: "Revoke" },
];
