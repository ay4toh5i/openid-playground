import { Paper, Button, Stack, Text, Switch, Alert, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { exchangeCodeForToken, buildTokenCurlCommand } from "../../../lib/oauth";
import { CopyButton } from "../../common/CopyButton";
import { CodeBlock } from "../../common/CodeBlock";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponse } from "../../../lib/oidc";

interface TokenExchangeStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  code: string | null | undefined;
  redirectUri: string;
  codeVerifier?: string;
  onTokenReceived: (token: TokenResponse) => void;
}

export function TokenExchangeStep({
  client,
  tokenEndpoint,
  code,
  redirectUri,
  codeVerifier,
  onTokenReceived,
}: TokenExchangeStepProps) {
  const [autoExecute, setAutoExecute] = useState(false);
  const executedRef = useRef(false);

  // Restore persisted value client-side only (localStorage is unavailable during SSR)
  useEffect(() => {
    setAutoExecute(
      Boolean(
        JSON.parse(localStorage.getItem("oidc-playground-token-exchange-auto-execute") ?? "false"),
      ),
    );
  }, []);

  const handleAutoExecuteChange = (value: boolean) => {
    setAutoExecute(value);
    localStorage.setItem("oidc-playground-token-exchange-auto-execute", String(value));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await exchangeCodeForToken(
        tokenEndpoint!,
        client!,
        code!,
        redirectUri,
        codeVerifier,
      );
      if ("error" in result) {
        throw new Error(
          `${result.error}${result.error_description ? ": " + result.error_description : ""}`,
        );
      }
      return result;
    },
    onSuccess: (token) => {
      onTokenReceived(token);
    },
  });

  // Auto-execute when code arrives and autoExecute is enabled
  useEffect(() => {
    if (autoExecute && code && client && tokenEndpoint && !executedRef.current) {
      executedRef.current = true;
      mutation.mutate();
    }
  }, [code, autoExecute]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset execution guard when code changes
  useEffect(() => {
    executedRef.current = false;
  }, [code]);

  if (!client || !tokenEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Complete the previous steps to exchange for tokens.
        </Text>
      </Paper>
    );
  }

  if (!code) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Stack gap="sm">
          <Switch
            label="Auto-execute when code arrives"
            checked={autoExecute}
            onChange={(e) => handleAutoExecuteChange(e.currentTarget.checked)}
          />
          <Text size="sm" c="dimmed">
            Waiting for authorization code...
          </Text>
        </Stack>
      </Paper>
    );
  }

  const curlCommand = buildTokenCurlCommand(tokenEndpoint, client, {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="sm">
        <Switch
          label="Auto-execute when code arrives"
          checked={autoExecute}
          onChange={(e) => handleAutoExecuteChange(e.currentTarget.checked)}
        />
        <Text size="sm" c="dimmed">
          Authorization code received. Click to exchange for tokens.
        </Text>
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Request:
            </Text>
            <CopyButton value={curlCommand} label="Copy" />
          </Group>
          <CodeBlock code={curlCommand} lang="bash" />
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Exchange for Token
        </Button>
        {mutation.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mt="sm">
            {mutation.error instanceof Error ? mutation.error.message : "Request failed"}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
