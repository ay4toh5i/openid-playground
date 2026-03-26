import { useReducer, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  localStorageColorSchemeManager,
  createTheme,
  Timeline,
  Text,
  Box,
  Paper,
  Button,
  Alert,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { ClientConfig, OIDCProviderMetadata } from "../lib/storage/client-config";
import { PlaygroundLayout } from "../components/layout/PlaygroundLayout";
import { ClientSelectionStep } from "../components/main/shared/ClientSelectionStep";
import { EndSessionStep } from "../components/main/end-session/EndSessionStep";

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
          borderRadius: "50%",
          backgroundColor: "var(--mantine-color-gray-6)",
          flexShrink: 0,
        }}
      />
    </Box>
  );
}

type EndSessionState = {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  logoutInitiated: boolean;
};

type EndSessionAction =
  | { type: "CLIENT_SELECTED"; client: ClientConfig; metadata: OIDCProviderMetadata }
  | { type: "LOGOUT_INITIATED" }
  | { type: "RESET" };

const initialState: EndSessionState = {
  client: null,
  metadata: null,
  logoutInitiated: false,
};

function reducer(state: EndSessionState, action: EndSessionAction): EndSessionState {
  switch (action.type) {
    case "CLIENT_SELECTED":
      return { ...state, client: action.client, metadata: action.metadata, logoutInitiated: false };
    case "LOGOUT_INITIATED":
      return { ...state, logoutInitiated: true };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function EndSessionFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("oidc-playground-last-flow", "end-session");
  }, []);

  const content = (
    <div>
      <Text size="xl" fw={600} mb="xl">
        RP-Initiated Logout (End Session)
      </Text>

      <Timeline bulletSize={28} lineWidth={2}>
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

        <Timeline.Item bullet={<NumberBullet n={2} />} title="Configure Logout Request">
          <Text size="sm" c="dimmed">
            Configure end-session parameters and initiate logout
          </Text>
          <EndSessionStep
            client={state.client}
            metadata={state.metadata}
            onLogoutInitiated={() => dispatch({ type: "LOGOUT_INITIATED" })}
          />
        </Timeline.Item>

        <Timeline.Item bullet={<DotBullet />} title="Logout Result">
          <Text size="sm" c="dimmed">
            Logout popup opened
          </Text>
          {state.logoutInitiated ? (
            <Paper p="md" mt="sm" withBorder>
              <Alert icon={<IconCheck size={16} />} color="green" mb="sm">
                Logout request initiated. A popup window was opened to the provider's end-session
                endpoint.
              </Alert>
              <Button variant="subtle" onClick={() => dispatch({ type: "RESET" })}>
                Reset
              </Button>
            </Paper>
          ) : (
            <Paper p="md" mt="sm" withBorder>
              <Text size="sm" c="dimmed">
                Complete the previous step to initiate logout.
              </Text>
            </Paper>
          )}
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
            currentFlow="end_session"
            tokenResponse={null}
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
