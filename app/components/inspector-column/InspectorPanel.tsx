/**
 * Inspector panel for token inspection
 */
import { Stack, Text, Paper, Divider } from "@mantine/core";
import { usePlayground } from "../../hooks/usePlaygroundState";
import { JwtInspector } from "./JwtInspector";
import { detectTokenType } from "../../lib/jwt/decoder";

export function InspectorPanel() {
  const { state } = usePlayground();

  if (!state.tokenResponse) {
    return (
      <Paper p="md" withBorder radius="md" style={{ textAlign: "center" }}>
        <Text size="sm" c="dimmed">
          No tokens to inspect
        </Text>
        <Text size="xs" c="dimmed" mt="xs">
          Complete a flow to see token details
        </Text>
      </Paper>
    );
  }

  const { id_token, access_token } = state.tokenResponse;
  const jwksUri = state.providerMetadata?.jwks_uri;
  const expectedNonce = state.authRequest?.nonce;

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>
        Token Inspector
      </Text>

      {id_token && (
        <>
          <JwtInspector token={id_token} label="ID Token" jwksUri={jwksUri} expectedNonce={expectedNonce} />
          {access_token && <Divider />}
        </>
      )}

      {access_token && (
        <>
          {detectTokenType(access_token) === "jwt" ? (
            <JwtInspector token={access_token} label="Access Token" jwksUri={jwksUri} />
          ) : (
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Access Token (Opaque)
              </Text>
              <Paper p="sm" withBorder>
                <Text size="xs" style={{ wordBreak: "break-all" }}>
                  {access_token}
                </Text>
              </Paper>
            </Stack>
          )}
        </>
      )}

      {state.tokenResponse.refresh_token && (
        <>
          <Divider />
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Refresh Token
            </Text>
            <Paper p="sm" withBorder>
              <Text size="xs" style={{ wordBreak: "break-all" }}>
                {state.tokenResponse.refresh_token}
              </Text>
            </Paper>
          </Stack>
        </>
      )}

      {state.tokenResponse.expires_in && (
        <>
          <Divider />
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Token Metadata
            </Text>
            <Text size="xs">
              <strong>Token Type:</strong> {state.tokenResponse.token_type}
            </Text>
            <Text size="xs">
              <strong>Expires In:</strong> {state.tokenResponse.expires_in} seconds
            </Text>
            {state.tokenResponse.scope && (
              <Text size="xs">
                <strong>Scope:</strong> {state.tokenResponse.scope}
              </Text>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
