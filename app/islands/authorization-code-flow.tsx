import { useReducer, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  localStorageColorSchemeManager,
  createTheme,
  Timeline,
  Text,
  Paper,
  Stack,
  Box,
} from "@mantine/core";
import type { ClientConfig, OIDCProviderMetadata } from "../lib/storage/client-config";
import type { AuthorizationRequestConfig, AuthorizationResponse, TokenResponse } from "../lib/oidc";
import { PlaygroundLayout } from "../components/layout/PlaygroundLayout";
import { ClientSelectionStep } from "../components/main/shared/ClientSelectionStep";
import { AuthorizationRequestStep } from "../components/main/authorization-code/AuthorizationRequestStep";
import { AuthorizationExecuteStep } from "../components/main/authorization-code/AuthorizationExecuteStep";
import { CallbackReceivedStep } from "../components/main/authorization-code/CallbackReceivedStep";
import { TokenExchangeStep } from "../components/main/authorization-code/TokenExchangeStep";
import { TokenResponseStep } from "../components/main/shared/TokenResponseStep";
import { UserinfoStep } from "../components/main/authorization-code/UserinfoStep";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "oidc-playground-color-scheme",
});

const theme = createTheme({
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
  defaultGradient: { from: "blue", to: "cyan", deg: 45 },
});

function NumberBullet({ n }: { n: number }) {
  return (
    <Box
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        minHeight: 28,
        borderRadius: "50%",
        backgroundColor: "var(--mantine-color-blue-6)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {n}
    </Box>
  );
}

function DotBullet() {
  return (
    <Box
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        minHeight: 28,
        borderRadius: "50%",
        backgroundColor: "var(--mantine-color-gray-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Box
        style={{
          width: 10,
          height: 10,
          minWidth: 10,
          minHeight: 10,
          borderRadius: "50%",
          backgroundColor: "var(--mantine-color-gray-6)",
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

const queryClient = new QueryClient();

// State and actions

type AuthCodeState = {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  authRequest: AuthorizationRequestConfig | null;
  callback: AuthorizationResponse | null;
  tokenResponse: TokenResponse | null;
  userinfoResponse: Record<string, unknown> | null;
};

type AuthCodeAction =
  | { type: "CLIENT_SELECTED"; client: ClientConfig; metadata: OIDCProviderMetadata }
  | { type: "REQUEST_CONFIGURED"; request: AuthorizationRequestConfig }
  | { type: "CALLBACK_RECEIVED"; callback: AuthorizationResponse }
  | { type: "TOKEN_RECEIVED"; token: TokenResponse }
  | { type: "USERINFO_RECEIVED"; claims: Record<string, unknown> }
  | { type: "RESET" };

const initialState: AuthCodeState = {
  client: null,
  metadata: null,
  authRequest: null,
  callback: null,
  tokenResponse: null,
  userinfoResponse: null,
};

function reducer(state: AuthCodeState, action: AuthCodeAction): AuthCodeState {
  switch (action.type) {
    case "CLIENT_SELECTED":
      return {
        ...state,
        client: action.client,
        metadata: action.metadata,
        callback: null,
        tokenResponse: null,
      };
    case "REQUEST_CONFIGURED":
      return {
        ...state,
        authRequest: action.request,
        callback: null,
        tokenResponse: null,
      };
    case "CALLBACK_RECEIVED":
      return {
        ...state,
        callback: action.callback,
        tokenResponse: null,
      };
    case "TOKEN_RECEIVED":
      return { ...state, tokenResponse: action.token, userinfoResponse: null };
    case "USERINFO_RECEIVED":
      return { ...state, userinfoResponse: action.claims };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function AuthorizationCodeFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("oidc-playground-last-flow", "authorization-code");
  }, []);

  const redirectUri = mounted ? `${window.location.origin}/callback` : "/callback";

  const content = (
    <div>
      <Text size="xl" fw={600} mb="xl">
        Authorization Code Flow
      </Text>

      <Timeline bulletSize={28} lineWidth={2}>
        {/* Step 0: Redirect URI info */}
        <Timeline.Item bullet={<DotBullet />} title="Redirect URI">
          <Text size="sm" c="dimmed">
            Configure the callback URL
          </Text>
          <Paper p="md" mt="sm" withBorder>
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Redirect URI: {redirectUri}
              </Text>
              <Text size="xs" c="dimmed">
                This URL must be registered in your OAuth provider's configuration.
              </Text>
            </Stack>
          </Paper>
        </Timeline.Item>

        {/* Step 1: Client Selection */}
        <Timeline.Item bullet={<NumberBullet n={1} />} title="Select Client">
          <Text size="sm" c="dimmed">
            Choose your OAuth client configuration
          </Text>
          <ClientSelectionStep
            onClientSelected={(client, metadata) =>
              dispatch({ type: "CLIENT_SELECTED", client, metadata })
            }
          />
        </Timeline.Item>

        {/* Step 2: Authorization Request */}
        <Timeline.Item bullet={<NumberBullet n={2} />} title="Authorization Request">
          <Text size="sm" c="dimmed">
            Configure authorization parameters
          </Text>
          <AuthorizationRequestStep
            onRequestConfigured={(request) => dispatch({ type: "REQUEST_CONFIGURED", request })}
          />
        </Timeline.Item>

        {/* Step 3: Execute Authorization */}
        <Timeline.Item bullet={<NumberBullet n={3} />} title="Execute Authorization">
          <Text size="sm" c="dimmed">
            Open authorization page
          </Text>
          <AuthorizationExecuteStep
            client={state.client}
            metadata={state.metadata}
            authRequest={state.authRequest}
            redirectUri={redirectUri}
            onCallbackReceived={(callback) => dispatch({ type: "CALLBACK_RECEIVED", callback })}
          />
        </Timeline.Item>

        {/* Step 4: Callback Received */}
        <Timeline.Item bullet={<DotBullet />} title="Callback Received">
          <Text size="sm" c="dimmed">
            Authorization code received
          </Text>
          <CallbackReceivedStep
            callback={state.callback}
            expectedState={state.authRequest?.state}
          />
        </Timeline.Item>

        {/* Step 5: Token Exchange */}
        <Timeline.Item bullet={<NumberBullet n={4} />} title="Token Exchange">
          <Text size="sm" c="dimmed">
            Exchange code for tokens
          </Text>
          <TokenExchangeStep
            client={state.client}
            tokenEndpoint={state.metadata?.token_endpoint}
            code={state.callback?.code}
            redirectUri={redirectUri}
            codeVerifier={state.authRequest?.code_verifier}
            onTokenReceived={(token) => dispatch({ type: "TOKEN_RECEIVED", token })}
          />
        </Timeline.Item>

        {/* Step 6: Token Response */}
        <Timeline.Item bullet={<DotBullet />} title="Token Response">
          <Text size="sm" c="dimmed">
            Tokens received successfully
          </Text>
          <TokenResponseStep
            tokenResponse={state.tokenResponse}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </Timeline.Item>

        {/* Step 7: UserInfo */}
        <Timeline.Item bullet={<NumberBullet n={5} />} title="UserInfo">
          <Text size="sm" c="dimmed">
            Fetch claims from the UserInfo endpoint
          </Text>
          <UserinfoStep
            client={state.client}
            userinfoEndpoint={state.metadata?.userinfo_endpoint}
            tokenResponse={state.tokenResponse}
            onUserinfoReceived={(claims) => dispatch({ type: "USERINFO_RECEIVED", claims })}
          />
        </Timeline.Item>
      </Timeline>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={theme}
        colorSchemeManager={colorSchemeManager}
        defaultColorScheme="light"
      >
        {mounted ? (
          <PlaygroundLayout
            currentFlow="authorization_code"
            tokenResponse={state.tokenResponse}
            providerMetadata={state.metadata}
            authRequest={state.authRequest}
          >
            {content}
          </PlaygroundLayout>
        ) : (
          <div style={{ minHeight: "100vh" }} />
        )}
      </MantineProvider>
    </QueryClientProvider>
  );
}
