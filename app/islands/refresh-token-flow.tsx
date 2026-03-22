/**
 * Refresh Token Flow island - self-contained with its own state management
 */
import { useReducer, useState, useEffect } from "react";
import {
  MantineProvider,
  localStorageColorSchemeManager,
  createTheme,
  Timeline,
  Text,
  Box,
} from "@mantine/core";
import type { ClientConfig, OIDCProviderMetadata } from "../lib/storage/client-config";
import type { TokenResponseData, TokenErrorData } from "../lib/flow-types";
import { PlaygroundLayout } from "../components/layout/PlaygroundLayout";
import { ClientSelectionStep } from "../components/main-column/steps/ClientSelectionStep";
import { RefreshTokenStep } from "../components/main-column/steps/RefreshTokenStep";
import { TokenResponseStep } from "../components/main-column/steps/TokenResponseStep";
import { ErrorAlert } from "../components/common/ErrorAlert";

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
          borderRadius: "50%",
          backgroundColor: "var(--mantine-color-gray-6)",
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

// State and actions

type RefreshTokenState = {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  tokenResponse: TokenResponseData | null;
  tokenError: TokenErrorData | null;
  error: string | null;
};

type RefreshTokenAction =
  | { type: "CLIENT_SELECTED"; client: ClientConfig; metadata: OIDCProviderMetadata }
  | { type: "TOKEN_RECEIVED"; token: TokenResponseData }
  | { type: "TOKEN_ERROR"; error: TokenErrorData }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

const initialState: RefreshTokenState = {
  client: null,
  metadata: null,
  tokenResponse: null,
  tokenError: null,
  error: null,
};

function reducer(state: RefreshTokenState, action: RefreshTokenAction): RefreshTokenState {
  switch (action.type) {
    case "CLIENT_SELECTED":
      return {
        ...state,
        client: action.client,
        metadata: action.metadata,
        tokenResponse: null,
        tokenError: null,
        error: null,
      };
    case "TOKEN_RECEIVED":
      return { ...state, tokenResponse: action.token, tokenError: null, error: null };
    case "TOKEN_ERROR":
      return { ...state, tokenError: action.error, tokenResponse: null };
    case "ERROR":
      return { ...state, error: action.message };
    case "CLEAR_ERROR":
      return { ...state, error: null, tokenError: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function RefreshTokenFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("oidc-playground-last-flow", "refresh-token");
  }, []);

  const content = (
    <div>
      <Text size="xl" fw={600} mb="xl">
        Refresh Token Flow
      </Text>

      {state.error && (
        <ErrorAlert
          error={state.error}
          onClose={() => dispatch({ type: "CLEAR_ERROR" })}
        />
      )}
      {state.tokenError && (
        <ErrorAlert
          error={`Token Error: ${state.tokenError.error}${
            state.tokenError.error_description
              ? ` - ${state.tokenError.error_description}`
              : ""
          }`}
          onClose={() => dispatch({ type: "CLEAR_ERROR" })}
        />
      )}

      <Timeline bulletSize={28} lineWidth={2}>
        {/* Step 1: Client Selection - always shown */}
        <Timeline.Item bullet={<NumberBullet n={1} />} title="Select Client">
          <Text size="sm" c="dimmed">
            Choose your OAuth client configuration
          </Text>
          <ClientSelectionStep
            onClientSelected={(client, metadata) =>
              dispatch({ type: "CLIENT_SELECTED", client, metadata })
            }
            onError={(message) => dispatch({ type: "ERROR", message })}
          />
        </Timeline.Item>

        {/* Step 2: Refresh Token - always shown */}
        <Timeline.Item bullet={<NumberBullet n={2} />} title="Refresh Token">
          <Text size="sm" c="dimmed">
            Enter refresh token to obtain new access token
          </Text>
          <RefreshTokenStep
            client={state.client}
            tokenEndpoint={state.metadata?.token_endpoint}
            onTokenReceived={(token) => dispatch({ type: "TOKEN_RECEIVED", token })}
            onTokenError={(error) => dispatch({ type: "TOKEN_ERROR", error })}
          />
        </Timeline.Item>

        {/* Step 3: Token Response - always shown */}
        <Timeline.Item bullet={<DotBullet />} title="Token Response">
          <Text size="sm" c="dimmed">
            New access token received
          </Text>
          <TokenResponseStep
            tokenResponse={state.tokenResponse}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </Timeline.Item>
      </Timeline>
    </div>
  );

  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="light"
    >
      {mounted ? (
        <PlaygroundLayout
          currentFlow="refresh_token"
          tokenResponse={state.tokenResponse}
          providerMetadata={state.metadata}
          authRequest={null}
        >
          {content}
        </PlaygroundLayout>
      ) : (
        <div style={{ minHeight: "100vh" }} />
      )}
    </MantineProvider>
  );
}
