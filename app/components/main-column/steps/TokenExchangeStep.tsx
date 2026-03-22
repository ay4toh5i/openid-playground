/**
 * Token exchange step
 */
import { Paper, Stack, Text, Code, Button, Switch } from "@mantine/core";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { useAuthorizationFlow } from "../../../hooks/useAuthorizationFlow";
import { useState, useEffect } from "react";

const AUTO_EXCHANGE_KEY = "oidc_auto_exchange_token";

export function TokenExchangeStep() {
  const { state, dispatch } = usePlayground();
  const { exchangeCodeForToken } = useAuthorizationFlow();
  const [loading, setLoading] = useState(false);
  const [autoExchange, setAutoExchange] = useState(() => {
    const saved = localStorage.getItem(AUTO_EXCHANGE_KEY);
    return saved === "true";
  });

  // Auto-exchange if enabled and callback received
  useEffect(() => {
    if (
      autoExchange &&
      state.authCallback?.code &&
      !state.tokenResponse &&
      !loading
    ) {
      handleExchange();
    }
  }, [autoExchange, state.authCallback]);

  const handleExchange = async () => {
    if (!state.selectedClient || !state.providerMetadata || !state.authCallback) {
      return;
    }

    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/callback`;
      const tokenResponse = await exchangeCodeForToken(
        state.providerMetadata.token_endpoint,
        state.selectedClient,
        state.authCallback.code,
        redirectUri,
        state.pkce?.verifier
      );

      dispatch({ type: "SET_TOKEN_RESPONSE", payload: tokenResponse });
      dispatch({ type: "ADVANCE_STEP" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Token exchange failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoExchangeToggle = (checked: boolean) => {
    setAutoExchange(checked);
    localStorage.setItem(AUTO_EXCHANGE_KEY, String(checked));
  };

  if (!state.authCallback?.code) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Waiting for authorization callback...
        </Text>
      </Paper>
    );
  }

  const tokenRequest = {
    grant_type: "authorization_code",
    code: state.authCallback?.code,
    redirect_uri: `${window.location.origin}/callback`,
    ...(state.pkce?.verifier && { code_verifier: state.pkce.verifier }),
  };

  const authMethod = state.selectedClient?.clientAuthenticationMethod || "none";

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <Switch
          label="Auto-exchange authorization code"
          description="Automatically exchange code for tokens when callback is received"
          checked={autoExchange}
          onChange={(event) => handleAutoExchangeToggle(event.currentTarget.checked)}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Token Endpoint:
          </Text>
          <Code block>{state.providerMetadata?.token_endpoint}</Code>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Request Body:
          </Text>
          <Code block>{JSON.stringify(tokenRequest, null, 2)}</Code>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Client Authentication Method:
          </Text>
          <Code>{authMethod}</Code>
        </div>

        <Button onClick={handleExchange} loading={loading} disabled={!!state.tokenResponse}>
          {state.tokenResponse ? "✓ Token Exchanged" : "Exchange Code for Tokens"}
        </Button>
      </Stack>
    </Paper>
  );
}
