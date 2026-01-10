# oidc-playground

## Requirements

### Technical Stacks

- deno
- honox
  - island architecture
  - react renderer

### Functions

- register OIDC/OAuth Client
  - Both of confidential client and public client
  - Cliet Authentication
    - client_secret_post
    - client_secret_basic
    - private_key_jwt
    - none
  - store clients data into local storage
  - support importing clients and exporting clients with json file
- Support OIDC/OAuth flows and show results every step, support executing steps
  by manually and automatically
  - Authorization Code Grant
    - optional params
      - pkce
      - nonce
      - prompt
  - Client Credentials Grant
  - token refresh
  - userinfo
  - logout
  - revoke

## References

- [OAuth2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [https://oauth.tools/]
