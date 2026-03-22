/**
 * Inspector panel for token inspection (props-based, no context)
 */
import { Stack, Text, Paper, Divider } from "@mantine/core";
import type { TokenResponseData, AuthorizationRequestData } from "../../lib/flow-types";
import type { OIDCProviderMetadata } from "../../lib/storage/client-config";
import { JwtInspector } from "./JwtInspector";
import { detectTokenType } from "../../lib/jwt/decoder";

interface InspectorPanelProps {
  tokenResponse: TokenResponseData | null;
  providerMetadata: OIDCProviderMetadata | null;
  authRequest: AuthorizationRequestData | null;
}

export function InspectorPanel({ tokenResponse, providerMetadata, authRequest }: InspectorPanelProps) {
  if (!tokenResponse) {
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

  const { id_token, access_token } = tokenResponse;
  const jwksUri = providerMetadata?.jwks_uri;
  const expectedNonce = authRequest?.nonce;

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>
        Token Inspector
      </Text>

      {id_token && (
        <>
          <JwtInspector
            token={id_token}
            label="ID Token"
            jwksUri={jwksUri}
            expectedNonce={expectedNonce}
          />
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

      {tokenResponse.refresh_token && (
        <>
          <Divider />
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Refresh Token
            </Text>
            <Paper p="sm" withBorder>
              <Text size="xs" style={{ wordBreak: "break-all" }}>
                {tokenResponse.refresh_token}
              </Text>
            </Paper>
          </Stack>
        </>
      )}

      {tokenResponse.expires_in && (
        <>
          <Divider />
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Token Metadata
            </Text>
            <Text size="xs">
              <strong>Token Type:</strong> {tokenResponse.token_type}
            </Text>
            <Text size="xs">
              <strong>Expires In:</strong> {tokenResponse.expires_in} seconds
            </Text>
            {tokenResponse.scope && (
              <Text size="xs">
                <strong>Scope:</strong> {tokenResponse.scope}
              </Text>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
