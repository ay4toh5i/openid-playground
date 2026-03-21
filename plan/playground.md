# Build OAuth / OIDC Playground

## Technical Stack

- react-hook-form
- mantine
- use type definitions in app/lib/oidc.ts

## Design

### Basic Architecture
- 4 columns
  - icons column
    - settings icon
    - import icon
    - export icon
  - flows column
    - selecting which flow stating. e.g. authorization code, client credentials, refresh, device code.
  - main column
    - step by step, display essentials config, register flow specific parameter, execute flow steps in timeline layout.
  - inspector column
    - inspect jwt, access token, id token if the token comformant the access token jwt spec, or OpenID Connect spec.

### Main Column

For instance, authorization code flow is like below.

1. show redirect uri
2. select a client which is registered in settings page. And then, enter authorization request paramater.
3. execute authorization request
    show the URL which is built by parameters from step 2.
    Executing the request in child page. And receive auth response details by post message.
4. receive callback
5. exchange code for token
    Actuallly, token request is execute through hono server for preventing cors error.
6. show token response
    show token response and response header.
    And refrect inspector column.

Build the components for each steps, and manage states in the container component.
