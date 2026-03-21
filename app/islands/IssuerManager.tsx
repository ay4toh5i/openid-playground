import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconRefresh, IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react";
import { useIssuers } from "../hooks/useIssuers";
import type { OpenIDConfiguration, Issuer } from "../lib/oauth/types";

export default function IssuerManager() {
  const { issuers, isLoading, addIssuer, deleteIssuer, refreshIssuer } = useIssuers();
  const [name, setName] = useState("");
  const [issuerUrl, setIssuerUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddIssuer = async () => {
    if (!name.trim() || !issuerUrl.trim()) {
      setError("Name and Issuer URL are required");
      return;
    }

    setError(null);
    setIsFetching(true);

    try {
      const response = await fetch(`/api/well-known?issuer=${encodeURIComponent(issuerUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch well-known configuration");
      }

      addIssuer(name.trim(), issuerUrl.trim(), data as OpenIDConfiguration);
      setName("");
      setIssuerUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleRefresh = async (issuer: Issuer) => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/well-known?issuer=${encodeURIComponent(issuer.issuer)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh");
      }

      refreshIssuer(issuer.id, data as OpenIDConfiguration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setIsFetching(false);
    }
  };

  if (isLoading) {
    return <Text size="sm" c="dimmed">Loading...</Text>;
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Issuers</Text>
      </Group>

      <Card withBorder radius="md" p="md">
        <Stack gap="sm">
          <TextInput
            label="Issuer name"
            placeholder="Auth0 Production"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <TextInput
            label="Issuer URL"
            placeholder="https://example.auth0.com"
            value={issuerUrl}
            onChange={(event) => setIssuerUrl(event.currentTarget.value)}
          />
          {error && (
            <Text size="xs" c="red">
              {error}
            </Text>
          )}
          <Button onClick={handleAddIssuer} loading={isFetching}>
            Add Issuer
          </Button>
        </Stack>
      </Card>

      <Stack gap="sm">
        {issuers.length === 0 ? (
          <Text size="sm" c="dimmed">
            No issuers registered yet.
          </Text>
        ) : (
          issuers.map((issuer) => (
            <Card key={issuer.id} withBorder radius="md" p="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text fw={600}>{issuer.name}</Text>
                  <Text size="sm" c="dimmed">
                    {issuer.issuer}
                  </Text>
                </Stack>
                <Group gap={6}>
                  <ActionIcon
                    variant="light"
                    aria-label="Refresh"
                    onClick={() => handleRefresh(issuer)}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    aria-label="Toggle details"
                    onClick={() => setExpandedId(expandedId === issuer.id ? null : issuer.id)}
                  >
                    {expandedId === issuer.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    aria-label="Delete"
                    onClick={() => deleteIssuer(issuer.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Collapse in={expandedId === issuer.id}>
                <Stack gap="xs" mt="md">
                  <Text size="xs" fw={600} c="dimmed">
                    Well-Known Configuration
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    <Badge color="gray" variant="light">
                      authorization_endpoint
                    </Badge>
                    <Text size="xs" style={{ wordBreak: "break-all" }}>
                      {issuer.wellKnown.authorization_endpoint}
                    </Text>
                  </Group>
                  <Group gap="xs" wrap="wrap">
                    <Badge color="gray" variant="light">
                      token_endpoint
                    </Badge>
                    <Text size="xs" style={{ wordBreak: "break-all" }}>
                      {issuer.wellKnown.token_endpoint}
                    </Text>
                  </Group>
                  {issuer.wellKnown.scopes_supported && (
                    <Group gap="xs" wrap="wrap">
                      <Badge color="gray" variant="light">
                        scopes_supported
                      </Badge>
                      <Text size="xs">{issuer.wellKnown.scopes_supported.join(", ")}</Text>
                    </Group>
                  )}
                  {issuer.wellKnown.code_challenge_methods_supported && (
                    <Group gap="xs" wrap="wrap">
                      <Badge color="gray" variant="light">
                        code_challenge_methods
                      </Badge>
                      <Text size="xs">
                        {issuer.wellKnown.code_challenge_methods_supported.join(", ")}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Collapse>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}
