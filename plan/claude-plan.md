# OAuth/OIDC Playground Implementation Plan

 ## Overview

 Implement a comprehensive OAuth/OIDC playground with a 4-column layout using HonoX + React +
  Mantine. The playground will support Authorization Code, Client Credentials, and Refresh
 Token flows with step-by-step execution and token inspection.

 Tech Stack

 - UI Framework: Mantine v7 (components + styling)
 - Form Management: react-hook-form + react-hook-form-mantine
 - JWT Handling: jose library
 - Crypto: Web Crypto API (native, no external dependencies)
 - State Management: React Context + useReducer
 - Type Definitions: Existing app/lib/oidc/oidc.ts

 Dependencies to Install

 # Core UI and forms
 npm install @mantine/core@^7.16.2 @mantine/hooks@^7.16.2
 npm install react-hook-form@^7.54.2 react-hook-form-mantine@^4.0.1

 # JWT and icons
 npm install jose@^5.9.6
 npm install @tabler/icons-react@^3.31.0

 # Remove Tailwind CSS (replaced by Mantine styling)
 npm uninstall tailwindcss @tailwindcss/vite

 Architecture

 4-Column Layout

 1. Icons Column (48px) - Settings, Import, Export icons
 2. Flows Column (~200px) - Flow type selection cards
 3. Main Column (flexible) - Step-by-step timeline with forms
 4. Inspector Column (~350px) - JWT/token inspection

 State Management

 - Central PlaygroundContext with useReducer
 - State includes: selected flow, client config, auth request/response, tokens, PKCE values,
 current step
 - LocalStorage for persisting client configurations

 HonoX Architecture

 - Islands: Interactive client components (playground.tsx, client-config-manager.tsx)
 - Routes: Server-rendered pages and API endpoints
 - API Endpoints: Token exchange proxy to avoid CORS

 Key Files to Create

 1. Core Utilities

 app/lib/crypto/pkce.ts
 - generateCodeVerifier() - Using Web Crypto API
 - generateCodeChallenge(verifier, method) - SHA-256 hashing
 - base64UrlEncode() - Base64URL encoding

 app/lib/jwt/decoder.ts
 - decodeJWT(token) - Parse JWT using jose
 - verifyJWT(token, jwksUri) - Signature verification
 - detectTokenType(token) - JWT vs opaque token detection

 app/lib/storage/client-config.ts
 - ClientConfigStorage.getAll() - Retrieve saved clients
 - ClientConfigStorage.save(client) - Save new client
 - ClientConfigStorage.delete(id) - Remove client
 - ClientConfigStorage.export() - Export as JSON
 - ClientConfigStorage.import(json) - Import from JSON

 2. State Management

 app/hooks/usePlaygroundState.ts
 - Define PlaygroundState interface
 - Implement playgroundReducer with actions:
   - SELECT_FLOW, SELECT_CLIENT
   - SET_AUTH_REQUEST, SET_AUTH_RESPONSE
   - SET_TOKEN_RESPONSE
   - ADVANCE_STEP, RESET_FLOW
   - SET_ERROR
 - Export PlaygroundProvider and usePlayground() hook

 app/hooks/useAuthorizationFlow.ts
 - startAuthorizationRequest() - Open popup, handle postMessage
 - exchangeCodeForToken() - Call token exchange API
 - Manage PKCE state (code_verifier)

 3. API Endpoints

 app/routes/api/token-exchange.ts
 - POST endpoint accepting: tokenEndpoint, tokenRequest, client
 - Handle all client authentication methods:
   - client_secret_basic: Basic auth header
   - client_secret_post: Form body params
   - private_key_jwt: Generate client_assertion
   - none: Public client
 - Return: { status, headers, body }

 app/routes/callback.tsx
 - OAuth callback handler page
 - Extract code/state from URL params
 - postMessage to window.opener
 - Auto-close window

 4. Layout & Components

 app/components/layout/PlaygroundLayout.tsx
 - Mantine Grid with responsive columns
 - AppShell wrapper
 - Render: IconsPanel, FlowSelector, FlowTimeline, InspectorPanel

 app/components/icons-column/IconsPanel.tsx
 - ActionIcon buttons for Settings, Import, Export
 - Link to /settings page

 app/components/flows-column/FlowSelector.tsx
 - Stack of FlowCard components
 - Flow options: Authorization Code, Client Credentials, Refresh Token
 - Device Code marked as "Coming Soon"

 app/components/main-column/FlowTimeline.tsx
 - Mantine Timeline component
 - Render steps based on selected flow
 - Step states: pending, active, completed

 app/components/main-column/steps/
 - RedirectUriStep.tsx - Display callback URL
 - ClientSelectionStep.tsx - Select configured client
 - AuthorizationRequestStep.tsx - Form for auth params (react-hook-form)
 - AuthorizationExecuteStep.tsx - Show URL, execute button
 - CallbackReceivedStep.tsx - Display received code/state
 - TokenExchangeStep.tsx - Exchange code, show request
 - TokenResponseStep.tsx - Display token response

 app/components/inspector-column/InspectorPanel.tsx
 - Tabs for different inspections
 - Render JwtInspector or TokenInspector based on token type

 app/components/inspector-column/JwtInspector.tsx
 - Tabs: Header, Payload, Signature
 - Mantine Code blocks for JSON display
 - Signature verification badge
 - Highlight standard claims (iss, aud, exp, etc.)

 5. Main Island

 app/islands/playground.tsx
 - Main interactive component
 - Wrap in PlaygroundProvider
 - Render PlaygroundLayout
 - Handle all client-side state changes

 6. Settings Page

 app/routes/settings/index.tsx
 - Server-rendered settings page
 - Render ClientConfigManager island

 app/islands/client-config-manager.tsx
 - List saved clients (Cards)
 - Add/Edit/Delete client forms
 - Import/Export buttons
 - Modal for client creation with form:
   - Provider issuer (fetch .well-known/openid-configuration)
   - Client ID
   - Client authentication method
   - Client secret (if applicable)
   - Private key (if applicable)

 7. Mantine Setup

 app/routes/_renderer.tsx
 - Import Mantine CSS: @mantine/core/styles.css
 - Wrap with MantineProvider (optional custom theme)
 - Remove Tailwind CSS references

 app/style.css
 - Import Mantine styles: @import '@mantine/core/styles.css';
 - Custom CSS overrides if needed

 Implementation Flow Example: Authorization Code

 1. User selects "Authorization Code" flow
   - Sets selectedFlow in state
   - Advances to step 0
 2. Step 0: Redirect URI
   - Display: ${window.location.origin}/callback
   - Auto-advance to step 1
 3. Step 1: Client Selection
   - Select from saved clients (or link to settings to add)
   - Load provider metadata
   - Set selectedClient in state
   - Advance to step 2
 4. Step 2: Authorization Request
   - react-hook-form with fields:
       - scope (default: "openid profile email")
     - response_type (default: "code")
     - state (auto-generated random)
     - nonce (auto-generated random)
     - Optional: prompt, max_age, ui_locales, etc.
   - Generate PKCE code_verifier and code_challenge
   - On submit: Set authRequest in state, advance to step 3
 5. Step 3: Execute Authorization
   - Display full authorization URL
   - Button: "Open Authorization Page"
   - On click:
       - Open popup window to authorization_endpoint
     - Listen for postMessage from callback page
   - Advance to step 4 when callback received
 6. Step 4: Callback Received
   - Display code and state from callback
   - Auto-advance to step 5
 7. Step 5: Token Exchange
   - Build AuthorizationCodeTokenRequest
   - Include code_verifier for PKCE
   - Call /api/token-exchange
   - Show loading state
   - On success: Set tokenResponse, advance to step 6
 8. Step 6: Token Response
   - Display token response JSON
   - Update InspectorPanel with tokens
   - Show "Reset Flow" button

 Inspector Logic

 1. Detect token types:
   - If id_token exists: Decode and show in JWT Inspector
   - If access_token is JWT format: Decode and show
   - If access_token is opaque: Show raw value
 2. JWT Inspector tabs:
   - Header: Show algorithm, key ID, etc.
   - Payload: Show all claims with descriptions
   - Signature: Verify using jwks_uri
 3. Token Inspector:
   - Show expires_in countdown
   - Show scope list
   - Show token_type

 PKCE Implementation (Web Crypto API)

 // app/lib/crypto/pkce.ts
 export function generateCodeVerifier(): string {
   const array = new Uint8Array(32);
   crypto.getRandomValues(array);
   return base64UrlEncode(array);
 }

 export async function generateCodeChallenge(
   verifier: string,
   method: 'S256' | 'plain'
 ): Promise<string> {
   if (method === 'plain') return verifier;

   const encoder = new TextEncoder();
   const data = encoder.encode(verifier);
   const hash = await crypto.subtle.digest('SHA-256', data);
   return base64UrlEncode(new Uint8Array(hash));
 }

 function base64UrlEncode(array: Uint8Array): string {
   const base64 = btoa(String.fromCharCode(...array));
   return base64
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=/g, '');
 }

 Client Authentication in Token Exchange

 // app/routes/api/token-exchange.ts
 const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
 const formBody = new URLSearchParams();

 // Add grant-specific params
 Object.entries(tokenRequest).forEach(([key, value]) => {
   if (value !== undefined) formBody.append(key, String(value));
 });

 // Handle client authentication
 switch (client.clientAuthenticationMethod) {
   case 'client_secret_basic':
     const creds = btoa(`${client.clientId}:${client.clientSecret}`);
     headers.set('Authorization', `Basic ${creds}`);
     break;

   case 'client_secret_post':
     formBody.append('client_id', client.clientId);
     formBody.append('client_secret', client.clientSecret);
     break;

   case 'private_key_jwt':
     const assertion = await generateClientAssertion(/* ... */);
     formBody.append('client_assertion', assertion);
     formBody.append('client_assertion_type',
       'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
     break;

   case 'none':
     formBody.append('client_id', client.clientId);
     break;
 }

 Error Handling

 - Network errors: Show Alert with retry button
 - OAuth errors: Parse error, error_description, display in step
 - Validation errors: react-hook-form inline validation
 - Popup blocked: Detect and show instructions
 - Token verification failures: Show details in inspector

 Testing Verification

 End-to-End Test (Authorization Code Flow)

 1. Start dev server: npm run dev
 2. Navigate to http://localhost:5174/
 3. Click Settings icon → Add new client
 4. Configure Google OAuth client:
   - Issuer: https://accounts.google.com
   - Client ID: (your Google OAuth client ID)
   - Client Secret: (your client secret)
   - Auth method: client_secret_post
 5. Save client
 6. Return to playground
 7. Select "Authorization Code" flow
 8. Select the Google client
 9. Fill authorization request:
   - Scope: openid profile email
   - Keep defaults for other fields
 10. Click "Execute Authorization"
 11. Complete Google sign-in in popup
 12. Verify callback received with code
 13. Verify token exchange succeeds
 14. Verify tokens displayed in response
 15. Check Inspector:
   - ID token decoded correctly
   - Access token shown (opaque or JWT)
   - Signature verification works
 16. Test Refresh Token flow with the refresh_token

 Client Credentials Test

 1. Configure Auth0 or other provider with client credentials grant
 2. Select "Client Credentials" flow
 3. Enter scope
 4. Execute
 5. Verify token received
 6. Verify token in inspector

 Implementation Phases

 Phase 1: Foundation (Priority 1)

 - Install dependencies
 - Set up Mantine in _renderer.tsx
 - Remove Tailwind CSS
 - Create basic 4-column layout
 - Implement LocalStorage utilities
 - Create settings page structure

 Phase 2: State & Utilities (Priority 1)

 - Implement usePlaygroundState hook
 - Implement PKCE utilities (Web Crypto API)
 - Implement JWT decoder utilities
 - Create type definitions for playground state

 Phase 3: Authorization Code Flow (Priority 1)

 - Create all 7 step components
 - Implement callback handler page
 - Build token exchange API endpoint
 - Wire up useAuthorizationFlow hook
 - Test end-to-end with real provider

 Phase 4: Inspector (Priority 2)

 - Build JWT inspector component
 - Build token inspector component
 - Add response headers display
 - Implement signature verification

 Phase 5: Additional Flows (Priority 2)

 - Implement Client Credentials flow
 - Implement Refresh Token flow
 - Add flow switching logic

 Phase 6: Polish (Priority 3)

 - Error handling improvements
 - Loading states and animations
 - Accessibility improvements
 - Responsive design refinements

 Future Enhancements (Not in Initial Implementation)

 - Device Code flow
 - Implicit flow (deprecated)
 - Token introspection
 - UserInfo endpoint testing
 - Token revocation
 - Request object (JAR) support
 - PAR (Pushed Authorization Request)
 - Flow history and replay

 Critical Files Summary

 1. app/lib/crypto/pkce.ts - PKCE generation using Web Crypto API
 2. app/hooks/usePlaygroundState.ts - Central state management
 3. app/routes/api/token-exchange.ts - Server-side token proxy
 4. app/islands/playground.tsx - Main interactive island
 5. app/components/layout/PlaygroundLayout.tsx - 4-column layout
 6. app/routes/callback.tsx - OAuth callback handler
 7. app/lib/storage/client-config.ts - Client config persistence
 8. app/components/inspector-column/JwtInspector.tsx - JWT inspection
 9. app/routes/_renderer.tsx - Update with Mantine setup
 10. app/routes/settings/index.tsx - Client configuration UI

 Notes

 - Always use PKCE for Authorization Code flow (enabled by default)
 - Generate random state parameter for CSRF protection
 - Use nonce for OIDC flows to prevent replay attacks
 - Warn users not to use production credentials
 - All client configs stored in browser LocalStorage
 - Token exchange happens server-side to avoid CORS issues

