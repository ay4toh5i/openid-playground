import { Paper, Button, Stack, Text, Group, Alert } from "@mantine/core";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  buildAuthorizationUrl,
  startAuthorizationRequest,
} from "../../../lib/oauth";
import { CopyButton } from "../../common/CopyButton";
import { CodeBlock } from "../../common/CodeBlock";
import type { ClientConfig, OIDCProviderMetadata } from "../../../lib/storage/client-config";
import type { AuthorizationRequestConfig, AuthorizationResponse } from "../../../lib/oidc";

interface AuthorizationExecuteStepProps {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  authRequest: AuthorizationRequestConfig | null;
  redirectUri: string;
  onCallbackReceived: (callback: AuthorizationResponse) => void;
}

export function AuthorizationExecuteStep({
  client,
  metadata,
  authRequest,
  redirectUri,
  onCallbackReceived,
}: AuthorizationExecuteStepProps) {
  const [authUrl, setAuthUrl] = useState("");

  useEffect(() => {
    if (!client || !metadata?.authorization_endpoint || !authRequest) { return; }
    void (async () => {
      setAuthUrl(await buildAuthorizationUrl(
        metadata.authorization_endpoint,
        client.clientId,
        redirectUri,
        authRequest,
      ));
    })();
  }, [client, metadata, authRequest, redirectUri]);

  const mutation = useMutation({
    mutationFn: async () => {
      const callback = await startAuthorizationRequest(authUrl);
      if (callback.state !== authRequest?.state) {
        throw new Error("State mismatch - possible CSRF attack");
      }
      return callback;
    },
    onSuccess: (callback) => {
      onCallbackReceived(callback);
    },
  });

  if (!client || !metadata?.authorization_endpoint || !authRequest) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Complete the previous steps to execute authorization.
        </Text>
      </Paper>
    );
  }

  const formatAuthUrl = (url: string) => {
    const [baseUrl, queryString] = url.split("?");
    if (!queryString) {
      return url;
    }
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
          <CodeBlock code={formatAuthUrl(authUrl)} lang="text" />
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Open Authorization Page
        </Button>
        {mutation.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {mutation.error instanceof Error ? mutation.error.message : "Authorization failed"}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
