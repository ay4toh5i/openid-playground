/**
 * Authorization execution step - props-based, no context
 */
import { Paper, Button, Stack, Text, Group } from "@mantine/core";
import { useState } from "react";
import { buildAuthorizationUrl, startAuthorizationRequest } from "../../../hooks/useAuthorizationFlow";
import { CopyButton } from "../../common/CopyButton";
import { CodeBlock } from "../../common/CodeBlock";
import type { ClientConfig, OIDCProviderMetadata } from "../../../lib/storage/client-config";
import type { AuthorizationRequestData, AuthorizationCallbackData } from "../../../lib/flow-types";

interface AuthorizationExecuteStepProps {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  authRequest: AuthorizationRequestData | null;
  redirectUri: string;
  onCallbackReceived: (callback: AuthorizationCallbackData) => void;
  onError: (error: string) => void;
}

export function AuthorizationExecuteStep({
  client,
  metadata,
  authRequest,
  redirectUri,
  onCallbackReceived,
  onError,
}: AuthorizationExecuteStepProps) {
  const [loading, setLoading] = useState(false);

  if (!client || !metadata?.authorization_endpoint || !authRequest) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">Complete the previous steps to execute authorization.</Text>
      </Paper>
    );
  }

  const authUrl = buildAuthorizationUrl(
    metadata.authorization_endpoint,
    client.clientId,
    redirectUri,
    authRequest
  );

  const formatAuthUrl = (url: string) => {
    const [baseUrl, queryString] = url.split("?");
    if (!queryString) return url;
    const params = queryString.split("&");
    return `${baseUrl}?\n  ${params.join("\n  &")}`;
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const callback = await startAuthorizationRequest(authUrl);
      if (callback.state !== authRequest.state) {
        throw new Error("State mismatch - possible CSRF attack");
      }
      onCallbackReceived(callback);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Authorization failed");
    } finally {
      setLoading(false);
    }
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
          <CodeBlock code={formatAuthUrl(authUrl)} lang="text" />
        </div>
        <Button onClick={handleExecute} loading={loading}>
          Open Authorization Page
        </Button>
      </Stack>
    </Paper>
  );
}
