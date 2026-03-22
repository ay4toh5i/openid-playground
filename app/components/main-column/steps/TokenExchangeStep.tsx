/**
 * Token exchange step - exchanges authorization code for tokens
 */
import { Paper, Button, Stack, Text, Switch } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { exchangeCodeForToken } from "../../../hooks/useAuthorizationFlow";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponseData, TokenErrorData } from "../../../lib/flow-types";

interface TokenExchangeStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  code: string | null | undefined;
  redirectUri: string;
  codeVerifier?: string;
  onTokenReceived: (token: TokenResponseData) => void;
  onTokenError: (error: TokenErrorData) => void;
}

export function TokenExchangeStep({
  client,
  tokenEndpoint,
  code,
  redirectUri,
  codeVerifier,
  onTokenReceived,
  onTokenError,
}: TokenExchangeStepProps) {
  const [loading, setLoading] = useState(false);
  const [autoExecute, setAutoExecute] = useState(false);
  const executedRef = useRef(false);

  const handleExchange = async () => {
    if (!client || !tokenEndpoint || !code) return;
    setLoading(true);
    const result = await exchangeCodeForToken(tokenEndpoint, client, code, redirectUri, codeVerifier);
    setLoading(false);
    if ("error" in result) {
      onTokenError(result);
    } else {
      onTokenReceived(result);
    }
  };

  // Auto-execute when code arrives and autoExecute is enabled
  useEffect(() => {
    if (autoExecute && code && client && tokenEndpoint && !executedRef.current) {
      executedRef.current = true;
      handleExchange();
    }
  }, [code, autoExecute]);

  // Reset execution guard when code changes
  useEffect(() => {
    executedRef.current = false;
  }, [code]);

  if (!client || !tokenEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">Complete the previous steps to exchange for tokens.</Text>
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
            onChange={(e) => setAutoExecute(e.currentTarget.checked)}
          />
          <Text size="sm" c="dimmed">Waiting for authorization code...</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="sm">
        <Switch
          label="Auto-execute when code arrives"
          checked={autoExecute}
          onChange={(e) => setAutoExecute(e.currentTarget.checked)}
        />
        <Text size="sm" c="dimmed">Authorization code received. Click to exchange for tokens.</Text>
        <Button onClick={handleExchange} loading={loading}>
          Exchange for Token
        </Button>
      </Stack>
    </Paper>
  );
}
