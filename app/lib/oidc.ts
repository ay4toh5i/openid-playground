type OIDCProviderMetadata = {
  /**
   * REQUIRED. URL using the https scheme with no query or fragment components that the OP asserts as its Issuer Identifier.
   * If Issuer discovery is supported, this value MUST be identical to the issuer value returned by WebFinger.
   * This also MUST be identical to the iss Claim value in ID Tokens issued from this Issuer.
   */
  issuer: string;

  /**
   * REQUIRED. URL of the OP's OAuth 2.0 Authorization Endpoint.
   * This URL MUST use the https scheme and MAY contain port, path, and query parameter components.
   */
  authorization_endpoint: string;

  /**
   * URL of the OP's OAuth 2.0 Token Endpoint. This is REQUIRED unless only the Implicit Flow is used.
   * This URL MUST use the https scheme and MAY contain port, path, and query parameter components.
   */
  token_endpoint?: string;

  /**
   * RECOMMENDED. URL of the OP's UserInfo Endpoint.
   * This URL MUST use the https scheme and MAY contain port, path, and query parameter components.
   */
  userinfo_endpoint?: string;

  /**
   * REQUIRED. URL of the OP's JWK Set document, which MUST use the https scheme.
   * This contains the signing key(s) the RP uses to validate signatures from the OP.
   * The JWK Set MAY also contain the Server's encryption key(s), which are used by RPs to encrypt requests to the Server.
   */
  jwks_uri: string;

  /**
   * RECOMMENDED. URL of the OP's Dynamic Client Registration Endpoint, which MUST use the https scheme.
   */
  registration_endpoint?: string;

  /**
   * RECOMMENDED. JSON array containing a list of the OAuth 2.0 scope values that this server supports.
   * The server MUST support the openid scope value.
   */
  scopes_supported?: string[];

  /**
   * REQUIRED. JSON array containing a list of the OAuth 2.0 response_type values that this OP supports.
   * Dynamic OpenID Providers MUST support the code, id_token, and the id_token token Response Type values.
   */
  response_types_supported: string[];

  /**
   * OPTIONAL. JSON array containing a list of the OAuth 2.0 response_mode values that this OP supports.
   * If omitted, the default for Dynamic OpenID Providers is ["query", "fragment"].
   */
  response_modes_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the OAuth 2.0 Grant Type values that this OP supports.
   * Dynamic OpenID Providers MUST support the authorization_code and implicit Grant Type values.
   * If omitted, the default value is ["authorization_code", "implicit"].
   */
  grant_types_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the Authentication Context Class References that this OP supports.
   */
  acr_values_supported?: string[];

  /**
   * REQUIRED. JSON array containing a list of the Subject Identifier types that this OP supports.
   * Valid types include pairwise and public.
   */
  subject_types_supported: string[];

  /**
   * REQUIRED. JSON array containing a list of the JWS signing algorithms (alg values) supported by the OP for the ID Token.
   * The algorithm RS256 MUST be included.
   * The value none MAY be supported but MUST NOT be used unless the Response Type used returns no ID Token from the Authorization Endpoint.
   */
  id_token_signing_alg_values_supported: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (alg values) supported by the OP for the ID Token.
   */
  id_token_encryption_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (enc values) supported by the OP for the ID Token.
   */
  id_token_encryption_enc_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (alg values) supported by the UserInfo Endpoint.
   * The value none MAY be included.
   */
  userinfo_signing_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (alg values) supported by the UserInfo Endpoint.
   */
  userinfo_encryption_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (enc values) supported by the UserInfo Endpoint.
   */
  userinfo_encryption_enc_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (alg values) supported by the OP for Request Objects.
   * These algorithms are used both when the Request Object is passed by value and when it is passed by reference.
   * Servers SHOULD support none and RS256.
   */
  request_object_signing_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (alg values) supported by the OP for Request Objects.
   */
  request_object_encryption_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWE encryption algorithms (enc values) supported by the OP for Request Objects.
   */
  request_object_encryption_enc_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of Client Authentication methods supported by this Token Endpoint.
   * The options are client_secret_post, client_secret_basic, client_secret_jwt, and private_key_jwt.
   * If omitted, the default is client_secret_basic.
   */
  token_endpoint_auth_methods_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (alg values) supported by the Token Endpoint
   * for the signature on the JWT used to authenticate the Client at the Token Endpoint.
   * Servers SHOULD support RS256. The value none MUST NOT be used.
   */
  token_endpoint_auth_signing_alg_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the display parameter values that the OpenID Provider supports.
   */
  display_values_supported?: string[];

  /**
   * OPTIONAL. JSON array containing a list of the Claim Types that the OpenID Provider supports.
   * Values defined by this specification are normal, aggregated, and distributed.
   * If omitted, the implementation supports only normal Claims.
   */
  claim_types_supported?: string[];

  /**
   * RECOMMENDED. JSON array containing a list of the Claim Names of the Claims that the OpenID Provider MAY be able to supply values for.
   * Note that for privacy or other reasons, this might not be an exhaustive list.
   */
  claims_supported?: string[];

  /**
   * OPTIONAL. URL of a page containing human-readable information that developers might want or need to know when using the OpenID Provider.
   */
  service_documentation?: string;

  /**
   * OPTIONAL. Languages and scripts supported for values in Claims being returned,
   * represented as a JSON array of BCP47 language tag values.
   */
  claims_locales_supported?: string[];

  /**
   * OPTIONAL. Languages and scripts supported for the user interface,
   * represented as a JSON array of BCP47 language tag values.
   */
  ui_locales_supported?: string[];

  /**
   * OPTIONAL. Boolean value specifying whether the OP supports use of the claims parameter, with true indicating support.
   * If omitted, the default value is false.
   */
  claims_parameter_supported?: boolean;

  /**
   * OPTIONAL. Boolean value specifying whether the OP supports use of the request parameter, with true indicating support.
   * If omitted, the default value is false.
   */
  request_parameter_supported?: boolean;

  /**
   * OPTIONAL. Boolean value specifying whether the OP supports use of the request_uri parameter, with true indicating support.
   * If omitted, the default value is true.
   */
  request_uri_parameter_supported?: boolean;

  /**
   * OPTIONAL. Boolean value specifying whether the OP requires any request_uri values used to be pre-registered.
   * Pre-registration is REQUIRED when the value is true. If omitted, the default value is false.
   */
  require_request_uri_registration?: boolean;

  /**
   * OPTIONAL. URL that the OpenID Provider provides to the person registering the Client to read about the OP's requirements
   * on how the Relying Party can use the data provided by the OP.
   */
  op_policy_uri?: string;

  /**
   * OPTIONAL. URL that the OpenID Provider provides to the person registering the Client to read about
   * the OpenID Provider's terms of service.
   */
  op_tos_uri?: string;
};

type ClietnAuthenticationMethod =
  | "none"
  | "client_secret_basic"
  | "client_secret_post"
  | "private_key_jwt";

type Client =
  | {
      clientId: string;
      clientAuthenticationMethod: "none";
    }
  | {
      clientId: string;
      clientAuthenticationMethod: "client_secret_basic" | "client_secret_post";
      clientSecret: string;
    }
  | {
      clientId: string;
      clientAuthenticationMethod: "private_key_jwt";
      privateKey: string;
    };

type AuthorizationRequest = {
  /**
   * REQUIRED. OpenID Connect requests MUST contain the openid scope value.
   * Other scope values MAY be present.
   */
  scope: string;

  /**
   * REQUIRED. OAuth 2.0 Response Type value that determines the authorization processing flow to be used.
   * - Authorization Code Flow: code
   * - Implicit Flow: id_token token or id_token
   * - Hybrid Flow: code id_token, code token, or code id_token token
   */
  response_type: string;

  /**
   * REQUIRED. OAuth 2.0 Client Identifier valid at the Authorization Server.
   */
  client_id: string;

  /**
   * REQUIRED. Redirection URI to which the response will be sent.
   * This URI MUST exactly match one of the Redirection URI values for the Client pre-registered at the OpenID Provider.
   */
  redirect_uri: string;

  /**
   * RECOMMENDED. Opaque value used to maintain state between the request and the callback.
   * Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by cryptographically binding the value of this parameter.
   */
  state?: string;

  /**
   * OPTIONAL for Authorization Code Flow. REQUIRED for Implicit Flow and Hybrid Flow.
   * String value used to associate a Client session with an ID Token, and to mitigate replay attacks.
   */
  nonce?: string;

  /**
   * OPTIONAL. Informs the Authorization Server of the mechanism to be used for returning parameters from the Authorization Endpoint.
   * Defined values include:
   * - query: Authorization Response parameters are encoded in the query string
   * - fragment: Authorization Response parameters are encoded in the fragment
   * - form_post: Authorization Response parameters are encoded as HTML form values (OAuth 2.0 Form Post Response Mode)
   */
  response_mode?: "query" | "fragment" | "form_post" | string;

  /**
   * OPTIONAL. ASCII string value that specifies how the Authorization Server displays the authentication and consent user interface pages.
   * Valid values are: page, popup, touch, wap
   */
  display?: "page" | "popup" | "touch" | "wap";

  /**
   * OPTIONAL. Space delimited, case sensitive list of ASCII string values that specifies whether the Authorization Server
   * prompts the End-User for reauthentication and consent.
   * Valid values are: none, login, consent, select_account
   */
  prompt?: string;

  /**
   * OPTIONAL. Maximum Authentication Age. Specifies the allowable elapsed time in seconds since the last time
   * the End-User was actively authenticated by the OP.
   */
  max_age?: number;

  /**
   * OPTIONAL. End-User's preferred languages and scripts for the user interface, represented as a space-separated list
   * of BCP47 language tag values, ordered by preference.
   */
  ui_locales?: string;

  /**
   * OPTIONAL. ID Token previously issued by the Authorization Server being passed as a hint about the End-User's
   * current or past authenticated session with the Client.
   */
  id_token_hint?: string;

  /**
   * OPTIONAL. Hint to the Authorization Server about the login identifier the End-User might use to log in.
   */
  login_hint?: string;

  /**
   * OPTIONAL. Requested Authentication Context Class Reference values.
   * Space-separated string that specifies the acr values that the Authorization Server is being requested to use
   * for processing this Authentication Request, with the values appearing in order of preference.
   */
  acr_values?: string;

  /**
   * OPTIONAL. Code challenge for PKCE (Proof Key for Code Exchange).
   * A challenge derived from the code verifier.
   */
  code_challenge?: string;

  /**
   * OPTIONAL. Code challenge method for PKCE.
   * Code verifier transformation method is "S256" or "plain".
   */
  code_challenge_method?: "S256" | "plain";

  /**
   * OPTIONAL. Indicates the target service or resource to which access is being requested (RFC 8707).
   * The value must be an absolute URI and must not include a fragment component.
   * Multiple resource parameters may be used to indicate that the requested token is intended to be used at multiple resources.
   */
  resource?: string | string[];
};

/**
 * Token Request using Authorization Code Grant
 */
type AuthorizationCodeTokenRequest = {
  /**
   * REQUIRED. Value must be "authorization_code".
   */
  grant_type: "authorization_code";

  /**
   * REQUIRED. The authorization code received from the authorization server.
   */
  code: string;

  /**
   * REQUIRED. The redirect URI used in the authorization request.
   * This value must exactly match the redirect_uri used in the authorization request.
   */
  redirect_uri: string;

  /**
   * OPTIONAL. The code verifier for PKCE (Proof Key for Code Exchange).
   * REQUIRED if the authorization request included a code_challenge.
   */
  code_verifier?: string;

  /**
   * The client identifier.
   * REQUIRED for public clients.
   * For confidential clients using client_secret_basic authentication, this is sent in the Authorization header.
   * For client_secret_post authentication, this is sent in the request body.
   */
  client_id?: string;

  /**
   * The client secret.
   * Used for client_secret_post authentication method.
   * For client_secret_basic, this is sent in the Authorization header instead.
   */
  client_secret?: string;

  /**
   * The JWT assertion used for client authentication.
   * Used for private_key_jwt or client_secret_jwt authentication methods.
   */
  client_assertion?: string;

  /**
   * The format of the client assertion.
   * REQUIRED when client_assertion is present.
   * Value must be "urn:ietf:params:oauth:client-assertion-type:jwt-bearer".
   */
  client_assertion_type?: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
};

/**
 * Token Request using Refresh Token Grant
 */
type RefreshTokenRequest = {
  /**
   * REQUIRED. Value must be "refresh_token".
   */
  grant_type: "refresh_token";

  /**
   * REQUIRED. The refresh token issued to the client.
   */
  refresh_token: string;

  /**
   * OPTIONAL. The scope of the access request.
   * The requested scope must not include any scope not originally granted by the resource owner,
   * and if omitted is treated as equal to the scope originally granted by the resource owner.
   */
  scope?: string;

  /**
   * The client identifier.
   * REQUIRED for public clients.
   * For confidential clients using client_secret_basic authentication, this is sent in the Authorization header.
   * For client_secret_post authentication, this is sent in the request body.
   */
  client_id?: string;

  /**
   * The client secret.
   * Used for client_secret_post authentication method.
   * For client_secret_basic, this is sent in the Authorization header instead.
   */
  client_secret?: string;

  /**
   * The JWT assertion used for client authentication.
   * Used for private_key_jwt or client_secret_jwt authentication methods.
   */
  client_assertion?: string;

  /**
   * The format of the client assertion.
   * REQUIRED when client_assertion is present.
   * Value must be "urn:ietf:params:oauth:client-assertion-type:jwt-bearer".
   */
  client_assertion_type?: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
};

/**
 * Token Request using Client Credentials Grant
 */
type ClientCredentialsTokenRequest = {
  /**
   * REQUIRED. Value must be "client_credentials".
   */
  grant_type: "client_credentials";

  /**
   * OPTIONAL. The scope of the access request.
   */
  scope?: string;

  /**
   * OPTIONAL. Indicates the target service or resource to which access is being requested (RFC 8707).
   */
  resource?: string | string[];

  /**
   * The client identifier.
   * For confidential clients using client_secret_basic authentication, this is sent in the Authorization header.
   * For client_secret_post authentication, this is sent in the request body.
   */
  client_id?: string;

  /**
   * The client secret.
   * Used for client_secret_post authentication method.
   * For client_secret_basic, this is sent in the Authorization header instead.
   */
  client_secret?: string;

  /**
   * The JWT assertion used for client authentication.
   * Used for private_key_jwt or client_secret_jwt authentication methods.
   */
  client_assertion?: string;

  /**
   * The format of the client assertion.
   * REQUIRED when client_assertion is present.
   * Value must be "urn:ietf:params:oauth:client-assertion-type:jwt-bearer".
   */
  client_assertion_type?: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
};

/**
 * Token Request - Union of all grant types
 */
type TokenRequest =
  | AuthorizationCodeTokenRequest
  | RefreshTokenRequest
  | ClientCredentialsTokenRequest;

/**
 * Successful Token Response (OAuth 2.0)
 */
type TokenResponse = {
  /**
   * REQUIRED. The access token issued by the authorization server.
   */
  access_token: string;

  /**
   * REQUIRED. The type of the token issued.
   * Value is case insensitive and typically "Bearer".
   */
  token_type: string;

  /**
   * RECOMMENDED. The lifetime in seconds of the access token.
   * For example, the value "3600" denotes that the access token will expire in one hour from the time the response was generated.
   */
  expires_in?: number;

  /**
   * OPTIONAL. The refresh token, which can be used to obtain new access tokens using the same authorization grant.
   */
  refresh_token?: string;

  /**
   * OPTIONAL. The scope of the access token.
   * REQUIRED if the scope is different from the scope requested by the client.
   */
  scope?: string;
};

/**
 * Successful Token Response for OpenID Connect
 */
type OpenIDConnectTokenResponse = TokenResponse & {
  /**
   * REQUIRED. ID Token value associated with the authenticated session.
   * The ID Token is a security token that contains Claims about the Authentication of an End-User by an Authorization Server.
   */
  id_token: string;
};

/**
 * Token Error Response
 */
type TokenErrorResponse = {
  /**
   * REQUIRED. A single ASCII error code.
   * Values include:
   * - invalid_request: The request is missing a required parameter
   * - invalid_client: Client authentication failed
   * - invalid_grant: The provided authorization grant is invalid, expired, revoked, etc.
   * - unauthorized_client: The authenticated client is not authorized to use this grant type
   * - unsupported_grant_type: The grant type is not supported by the authorization server
   * - invalid_scope: The requested scope is invalid, unknown, or malformed
   */
  error:
    | "invalid_request"
    | "invalid_client"
    | "invalid_grant"
    | "unauthorized_client"
    | "unsupported_grant_type"
    | "invalid_scope"
    | string;

  /**
   * OPTIONAL. Human-readable ASCII text providing additional information.
   */
  error_description?: string;

  /**
   * OPTIONAL. A URI identifying a human-readable web page with information about the error.
   */
  error_uri?: string;
};
