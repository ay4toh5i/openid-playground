import { useMemo } from "react";
import { Badge, Card, Code, Group, Stack, Tabs, Text, Title } from "@mantine/core";
import type { TokenResponse } from "../lib/oauth/types";
import {
  decodeJWT,
  isJWT,
  formatTimestamp,
  isTokenExpired,
  getTimeUntilExpiry,
} from "../lib/jwt/decoder";

interface TokenDisplayProps {
  tokenResponse: TokenResponse;
  expectedIssuer?: string;
  expectedAudience?: string;
  expectedNonce?: string;
}

type TokenCardProps = {
  title: string;
  token: string;
  badge?: string;
  expectedIssuer?: string;
  expectedAudience?: string;
  expectedNonce?: string;
};

function TokenCard({
  title,
  token,
  badge,
  expectedIssuer,
  expectedAudience,
  expectedNonce,
}: TokenCardProps) {
  const decoded = useMemo(() => {
    if (isJWT(token)) {
      return decodeJWT(token);
    }
    return null;
  }, [token]);

  const expInfo = useMemo(() => {
    if (decoded?.payload?.exp && typeof decoded.payload.exp === "number") {
      return {
        expired: isTokenExpired(decoded.payload.exp),
        timeUntil: getTimeUntilExpiry(decoded.payload.exp),
        expiresAt: formatTimestamp(decoded.payload.exp),
      };
    }
    return null;
  }, [decoded]);

  const validation = useMemo(() => {
    if (!decoded?.payload) {
      return null;
    }
    const iss = decoded.payload.iss as string | undefined;
    const audValue = decoded.payload.aud as string | string[] | undefined;
    const audList = Array.isArray(audValue) ? audValue : audValue ? [audValue] : [];
    const nonce = decoded.payload.nonce as string | undefined;

    const issValid = expectedIssuer ? iss === expectedIssuer : null;
    const audValid = expectedAudience ? audList.includes(expectedAudience) : null;
    const nonceValid = expectedNonce ? nonce === expectedNonce : null;

    return {
      iss,
      audList,
      nonce,
      issValid,
      audValid,
      nonceValid,
    };
  }, [decoded, expectedIssuer, expectedAudience, expectedNonce]);

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="sm" wrap="wrap">
        <Group gap="xs">
          <Text fw={600}>{title}</Text>
          {badge && (
            <Badge color="dark" variant="light">
              {badge}
            </Badge>
          )}
        </Group>
        {expInfo && (
          <Badge color="dark" variant="light">
            {expInfo.expired ? "Expired" : expInfo.timeUntil}
          </Badge>
        )}
      </Group>

      {decoded ? (
        <Tabs defaultValue="payload">
          <Tabs.List>
            <Tabs.Tab value="payload">Payload</Tabs.Tab>
            <Tabs.Tab value="header">Header</Tabs.Tab>
            <Tabs.Tab value="raw">Raw</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="payload" pt="sm">
            <Code block>{JSON.stringify(decoded.payload, null, 2)}</Code>
            {validation && (
              <Stack gap={4} mt="sm">
                <Text size="xs" c="dimmed">
                  Validation
                </Text>
                <Group gap="xs" wrap="wrap">
                  <Badge color="dark" variant="light">
                    iss:{" "}
                    {validation.issValid === null
                      ? "n/a"
                      : validation.issValid
                        ? "valid"
                        : "mismatch"}
                  </Badge>
                  <Badge color="dark" variant="light">
                    aud:{" "}
                    {validation.audValid === null
                      ? "n/a"
                      : validation.audValid
                        ? "valid"
                        : "mismatch"}
                  </Badge>
                  {expectedNonce && (
                    <Badge color="dark" variant="light">
                      nonce: {validation.nonceValid ? "valid" : "mismatch"}
                    </Badge>
                  )}
                </Group>
              </Stack>
            )}
            {expInfo && (
              <Text size="xs" c="dimmed" mt="xs">
                Expires: {expInfo.expiresAt}
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="header" pt="sm">
            <Code block>{JSON.stringify(decoded.header, null, 2)}</Code>
          </Tabs.Panel>

          <Tabs.Panel value="raw" pt="sm">
            <Code block>{decoded.raw.header}</Code>
            <Code block mt="xs">
              .{decoded.raw.payload}
            </Code>
            <Code block mt="xs">
              .{decoded.raw.signature}
            </Code>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Stack gap="xs">
          <Code block>{token}</Code>
          <Text size="xs" c="dimmed">
            Not a JWT token (opaque token)
          </Text>
        </Stack>
      )}
    </Card>
  );
}

export default function TokenDisplay({
  tokenResponse,
  expectedIssuer,
  expectedAudience,
  expectedNonce,
}: TokenDisplayProps) {
  return (
    <Stack gap="md">
      <Title order={4}>Token Response</Title>

      <TokenCard
        title="Access Token"
        token={tokenResponse.access_token}
        badge={tokenResponse.token_type}
        expectedIssuer={expectedIssuer}
        expectedAudience={expectedAudience}
      />

      {tokenResponse.id_token && (
        <TokenCard
          title="ID Token"
          token={tokenResponse.id_token}
          expectedIssuer={expectedIssuer}
          expectedAudience={expectedAudience}
          expectedNonce={expectedNonce}
        />
      )}

      {tokenResponse.refresh_token && (
        <TokenCard
          title="Refresh Token"
          token={tokenResponse.refresh_token}
          expectedIssuer={expectedIssuer}
          expectedAudience={expectedAudience}
        />
      )}

      <Card withBorder radius="md" p="md">
        <Title order={5} mb="xs">
          Additional Info
        </Title>
        <Stack gap={4}>
          {tokenResponse.expires_in && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Expires In:
              </Text>
              <Text size="sm">{tokenResponse.expires_in} seconds</Text>
            </Group>
          )}
          {tokenResponse.scope && (
            <Group gap="xs" align="flex-start">
              <Text size="sm" c="dimmed">
                Scope:
              </Text>
              <Text size="sm">{tokenResponse.scope}</Text>
            </Group>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
