/**
 * Flow timeline with step-by-step execution
 */
import { Timeline, Text, Paper, Button, Stack, Box } from "@mantine/core";
import { IconCircle, IconCircleCheck, IconCircleDot } from "@tabler/icons-react";
import { usePlayground } from "../../hooks/usePlaygroundState";
import { ClientSelectionStep } from "./steps/ClientSelectionStep";
import { AuthorizationRequestStep } from "./steps/AuthorizationRequestStep";
import { AuthorizationExecuteStep } from "./steps/AuthorizationExecuteStep";
import { CallbackReceivedStep } from "./steps/CallbackReceivedStep";
import { TokenExchangeStep } from "./steps/TokenExchangeStep";
import { TokenResponseStep } from "./steps/TokenResponseStep";
import { ClientCredentialsStep } from "./steps/ClientCredentialsStep";
import { RefreshTokenStep } from "./steps/RefreshTokenStep";
import { ErrorAlert } from "../common/ErrorAlert";

export function FlowTimeline() {
  const { state, dispatch } = usePlayground();

  if (!state.selectedFlow) {
    return (
      <Paper p="xl" withBorder radius="md" style={{ textAlign: "center" }}>
        <Text size="lg" fw={500} c="dimmed">
          Select a flow to get started
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Choose an OAuth/OIDC flow from the left panel
        </Text>
      </Paper>
    );
  }

  // Create numbered bullet for interactive steps
  const createNumberBullet = (number: number) => (
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
      {number}
    </Box>
  );

  // Create simple dot bullet for non-interactive steps
  const createDotBullet = () => (
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

  // Render steps based on selected flow
  if (state.selectedFlow === "authorization_code") {
    return (
      <div>
        <Text size="xl" fw={600} mb="xl">
          Authorization Code Flow
        </Text>
        {state.error && (
          <ErrorAlert error={state.error} onClose={() => dispatch({ type: "CLEAR_ERROR" })} />
        )}
        {state.tokenError && (
          <ErrorAlert
            error={`Token Error: ${state.tokenError.error}${
              state.tokenError.error_description ? ` - ${state.tokenError.error_description}` : ""
            }`}
            onClose={() => dispatch({ type: "CLEAR_ERROR" })}
          />
        )}
        <Timeline bulletSize={28} lineWidth={2}>
          <Timeline.Item bullet={createDotBullet()} title="Redirect URI">
            <Text size="sm" c="dimmed">
              Configure the callback URL
            </Text>
            <Paper p="md" mt="sm" withBorder>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Redirect URI: {window.location.origin}/callback
                </Text>
                <Text size="xs" c="dimmed">
                  This URL must be registered in your OAuth provider's configuration.
                </Text>
              </Stack>
            </Paper>
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(1)} title="Select Client">
            <Text size="sm" c="dimmed">
              Choose your OAuth client configuration
            </Text>
            <ClientSelectionStep />
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(2)} title="Authorization Request">
            <Text size="sm" c="dimmed">
              Configure authorization parameters
            </Text>
            <AuthorizationRequestStep />
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(3)} title="Execute Authorization">
            <Text size="sm" c="dimmed">
              Open authorization page
            </Text>
            <AuthorizationExecuteStep />
          </Timeline.Item>

          <Timeline.Item bullet={createDotBullet()} title="Callback Received">
            <Text size="sm" c="dimmed">
              Authorization code received
            </Text>
            <CallbackReceivedStep />
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(4)} title="Token Exchange">
            <Text size="sm" c="dimmed">
              Exchange code for tokens
            </Text>
            <TokenExchangeStep />
          </Timeline.Item>

          <Timeline.Item bullet={createDotBullet()} title="Token Response">
            <Text size="sm" c="dimmed">
              Tokens received successfully
            </Text>
            <TokenResponseStep />
          </Timeline.Item>
        </Timeline>
      </div>
    );
  }

  if (state.selectedFlow === "client_credentials") {
    return (
      <div>
        <Text size="xl" fw={600} mb="xl">
          Client Credentials Flow
        </Text>
        {state.error && (
          <ErrorAlert error={state.error} onClose={() => dispatch({ type: "CLEAR_ERROR" })} />
        )}
        {state.tokenError && (
          <ErrorAlert
            error={`Token Error: ${state.tokenError.error}${
              state.tokenError.error_description ? ` - ${state.tokenError.error_description}` : ""
            }`}
            onClose={() => dispatch({ type: "CLEAR_ERROR" })}
          />
        )}
        <Timeline bulletSize={28} lineWidth={2}>
          <Timeline.Item bullet={createNumberBullet(1)} title="Select Client">
            <Text size="sm" c="dimmed">
              Choose your OAuth client configuration
            </Text>
            <ClientSelectionStep />
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(2)} title="Token Request">
            <Text size="sm" c="dimmed">
              Configure token request parameters
            </Text>
            <ClientCredentialsStep />
          </Timeline.Item>

          <Timeline.Item bullet={createDotBullet()} title="Token Response">
            <Text size="sm" c="dimmed">
              Access token received
            </Text>
            <TokenResponseStep />
          </Timeline.Item>
        </Timeline>
      </div>
    );
  }

  if (state.selectedFlow === "refresh_token") {
    return (
      <div>
        <Text size="xl" fw={600} mb="xl">
          Refresh Token Flow
        </Text>
        {state.error && (
          <ErrorAlert error={state.error} onClose={() => dispatch({ type: "CLEAR_ERROR" })} />
        )}
        {state.tokenError && (
          <ErrorAlert
            error={`Token Error: ${state.tokenError.error}${
              state.tokenError.error_description ? ` - ${state.tokenError.error_description}` : ""
            }`}
            onClose={() => dispatch({ type: "CLEAR_ERROR" })}
          />
        )}
        <Timeline bulletSize={28} lineWidth={2}>
          <Timeline.Item bullet={createNumberBullet(1)} title="Select Client">
            <Text size="sm" c="dimmed">
              Choose your OAuth client configuration
            </Text>
            <ClientSelectionStep />
          </Timeline.Item>

          <Timeline.Item bullet={createNumberBullet(2)} title="Refresh Token">
            <Text size="sm" c="dimmed">
              Enter refresh token
            </Text>
            <RefreshTokenStep />
          </Timeline.Item>

          <Timeline.Item bullet={createDotBullet()} title="Token Response">
            <Text size="sm" c="dimmed">
              New access token received
            </Text>
            <TokenResponseStep />
          </Timeline.Item>
        </Timeline>
      </div>
    );
  }

  return null;
}
