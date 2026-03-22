/**
 * Authorization execution step
 */
import { Paper, Button, Stack, Code, Text, Group } from "@mantine/core";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { useAuthorizationFlow } from "../../../hooks/useAuthorizationFlow";
import { CopyButton } from "../../common/CopyButton";
import { useState } from "react";

export function AuthorizationExecuteStep() {
  const { state, dispatch } = usePlayground();
  const { buildAuthorizationUrl, startAuthorizationRequest } = useAuthorizationFlow();
  const [loading, setLoading] = useState(false);

  if (!state.selectedClient || !state.providerMetadata || !state.authRequest) {
    return null;
  }

  const redirectUri = `${window.location.origin}/callback`;
  const authUrl = buildAuthorizationUrl(
    state.providerMetadata.authorization_endpoint,
    state.selectedClient.clientId,
    redirectUri,
    state.authRequest
  );

  const handleExecute = async () => {
    setLoading(true);
    try {
      const callback = await startAuthorizationRequest(authUrl);

      // Verify state matches
      if (callback.state !== state.authRequest?.state) {
        throw new Error("State mismatch - possible CSRF attack");
      }

      dispatch({ type: "SET_AUTH_CALLBACK", payload: callback });
      dispatch({ type: "ADVANCE_STEP" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Authorization failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format URL with line breaks for better readability
  const formatAuthUrl = (url: string) => {
    const [baseUrl, queryString] = url.split("?");
    if (!queryString) return url;

    const params = queryString.split("&");
    return `${baseUrl}?\n  ${params.join("\n  &")}`;
  };

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Authorization URL:
            </Text>
            <CopyButton value={authUrl} label="Copy URL" />
          </Group>
          <Code block style={{ fontSize: "11px", overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {formatAuthUrl(authUrl)}
          </Code>
        </div>
        <Button onClick={handleExecute} loading={loading}>
          Open Authorization Page
        </Button>
      </Stack>
    </Paper>
  );
}
