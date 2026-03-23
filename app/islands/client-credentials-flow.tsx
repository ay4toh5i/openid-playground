import { useReducer, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  localStorageColorSchemeManager,
  createTheme,
  Timeline,
  Text,
  Box,
} from "@mantine/core";
import type { ClientConfig, OIDCProviderMetadata } from "../lib/storage/client-config";
import type { TokenResponse } from "../lib/oidc";
import { PlaygroundLayout } from "../components/layout/PlaygroundLayout";
import { ClientSelectionStep } from "../components/main/steps/ClientSelectionStep";
import { ClientCredentialsStep } from "../components/main/steps/ClientCredentialsStep";
import { TokenResponseStep } from "../components/main/steps/TokenResponseStep";

const queryClient = new QueryClient();

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

// State and actions

type ClientCredentialsState = {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  tokenResponse: TokenResponse | null;
};

type ClientCredentialsAction =
  | { type: "CLIENT_SELECTED"; client: ClientConfig; metadata: OIDCProviderMetadata }
  | { type: "TOKEN_RECEIVED"; token: TokenResponse }
  | { type: "RESET" };

const initialState: ClientCredentialsState = {
  client: null,
  metadata: null,
  tokenResponse: null,
};

function reducer(
  state: ClientCredentialsState,
  action: ClientCredentialsAction,
): ClientCredentialsState {
  switch (action.type) {
    case "CLIENT_SELECTED":
      return {
        ...state,
        client: action.client,
        metadata: action.metadata,
        tokenResponse: null,
      };
    case "TOKEN_RECEIVED":
      return { ...state, tokenResponse: action.token };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function ClientCredentialsFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("oidc-playground-last-flow", "client-credentials");
  }, []);

  const content = (
    <div>
      <Text size="xl" fw={600} mb="xl">
        Client Credentials Flow
      </Text>

      <Timeline bulletSize={28} lineWidth={2}>
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

        {/* Step 2: Token Request */}
        <Timeline.Item bullet={<NumberBullet n={2} />} title="Token Request">
          <Text size="sm" c="dimmed">
            Configure token request parameters
          </Text>
          <ClientCredentialsStep
            client={state.client}
            tokenEndpoint={state.metadata?.token_endpoint}
            onTokenReceived={(token) => dispatch({ type: "TOKEN_RECEIVED", token })}
          />
        </Timeline.Item>

        {/* Step 3: Token Response */}
        <Timeline.Item bullet={<DotBullet />} title="Token Response">
          <Text size="sm" c="dimmed">
            Access token received
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
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={theme}
        colorSchemeManager={colorSchemeManager}
        defaultColorScheme="light"
      >
        {mounted ? (
          <PlaygroundLayout
            currentFlow="client_credentials"
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
    </QueryClientProvider>
  );
}
