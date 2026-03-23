# OAuth/OIDC Playground

A comprehensive OAuth 2.0 and OpenID Connect testing playground built with HonoX, React, and Mantine.

## Features

### Supported Flows

- **Authorization Code Flow** with PKCE
- **Client Credentials Flow**
- **Refresh Token Flow**

### Key Capabilities

- 🔐 Step-by-step flow execution with interactive timeline
- 🔍 JWT inspection with signature verification
- 💾 Client configuration management with LocalStorage
- 📋 Import/Export client configurations
- 🎨 Clean, modern UI with Mantine v7
- 📱 Responsive 4-column layout
- 🔄 Real-time token expiration tracking
- 📑 Support for all OAuth client authentication methods:
  - `none` (Public clients)
  - `client_secret_basic`
  - `client_secret_post`
  - `private_key_jwt`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open http://localhost:5174/

### Quick Start Guide

#### 1. Add OAuth Client

1. Navigate to Settings (gear icon in left panel or `/settings`)
2. Click "Add Client"
3. Fill in the form:
   - **Name**: A friendly name for your client
   - **Issuer URL**: Your OAuth provider's issuer URL (e.g., `https://accounts.google.com`)
   - **Client ID**: Your OAuth client ID
   - **Client Authentication Method**: Choose the appropriate method
   - **Client Secret**: (if using secret-based auth)
   - **Private Key**: (if using `private_key_jwt`)

The app will automatically fetch the provider's metadata from `{issuer}/.well-known/openid-configuration`.

#### 2. Configure OAuth Provider

Register the redirect URI in your OAuth provider:

```
http://localhost:5174/callback
```

#### 3. Test a Flow

1. Return to home page
2. Select a flow type (Authorization Code, Client Credentials, or Refresh Token)
3. Follow the step-by-step wizard
4. Inspect tokens in the right panel

## Usage Examples

### Authorization Code Flow

1. Select "Authorization Code" flow
2. Verify redirect URI
3. Choose a configured OAuth client
4. Configure request parameters (scope, state, nonce)
5. Click "Open Authorization Page"
6. Complete authentication in popup
7. Token exchange happens automatically
8. Inspect tokens in the inspector panel

### Client Credentials Flow

1. Select "Client Credentials" flow
2. Choose a confidential client
3. Optionally set scope and resource
4. Request token
5. Inspect access token

### Refresh Token Flow

1. Select "Refresh Token" flow
2. Choose a client
3. Enter refresh token
4. Request new access token

## Features

### Token Inspector

The inspector panel provides detailed token analysis:

- **JWT Tokens**:
  - Decoded header with algorithm and key ID
  - All payload claims with descriptions
  - Signature verification using provider's JWKS
  - Expiration countdown

- **Opaque Tokens**:
  - Raw token value with copy button
  - Token metadata

### Import/Export

- **Export**: Download all client configurations as JSON
- **Import**: Upload and merge client configurations

### Copy to Clipboard

Copy buttons are available for:

- Authorization URLs
- Authorization codes
- Tokens
- Full JSON responses

## Architecture

Built with modern web technologies:

- **Framework**: HonoX (Hono + Vite)
- **UI**: React 19 + Mantine v7
- **State**: React Context + useReducer
- **Forms**: react-hook-form
- **JWT**: jose library
- **Crypto**: Web Crypto API

## Security Notes

⚠️ **Important**:

1. **Development tool only** - Not for production use
2. Client secrets stored in browser LocalStorage
3. Do not use production credentials
4. Always use HTTPS in production

## Development

```bash
# Format code
npm run fmt

# Lint code
npm run lint

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## License

MIT
