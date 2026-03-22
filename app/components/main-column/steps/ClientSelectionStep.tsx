/**
 * Client selection step - props-based, no context
 */
import { Paper, Select, Text, Stack } from "@mantine/core";
import { useState, useEffect } from "react";
import {
  ClientConfigStorage,
  fetchProviderMetadata,
  type ClientConfig,
  type OIDCProviderMetadata,
} from "../../../lib/storage/client-config";

const LAST_SELECTED_CLIENT_KEY = "oidc_last_selected_client";

interface ClientSelectionStepProps {
  onClientSelected: (client: ClientConfig, metadata: OIDCProviderMetadata) => void;
  onError: (error: string) => void;
}

export function ClientSelectionStep({ onClientSelected, onError }: ClientSelectionStepProps) {
  const [clients] = useState(() => ClientConfigStorage.getAll());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-select last used or first client on mount - legitimate data fetching useEffect
  useEffect(() => {
    if (clients.length === 0) return;
    const lastSelectedId = localStorage.getItem(LAST_SELECTED_CLIENT_KEY);
    const initialClient =
      (lastSelectedId ? clients.find((c) => c.id === lastSelectedId) : null) ?? clients[0];
    if (initialClient) {
      handleSelect(initialClient.id);
    }
  }, []);

  const handleSelect = async (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    setSelectedId(clientId);
    setLoading(true);
    try {
      let metadata = client.metadata;
      if (!metadata) {
        metadata = await fetchProviderMetadata(client.issuer);
        ClientConfigStorage.save({ ...client, metadata });
      }
      localStorage.setItem(LAST_SELECTED_CLIENT_KEY, clientId);
      onClientSelected({ ...client, metadata }, metadata);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to fetch provider metadata"
      );
    } finally {
      setLoading(false);
    }
  };

  if (clients.length === 0) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Stack gap="sm">
          <Text size="sm">No OAuth clients configured.</Text>
          <Text size="xs" c="dimmed">
            Click the settings icon to add a client.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" mt="sm" withBorder>
      <Select
        label="Select OAuth Client"
        placeholder="Choose a client"
        data={clients.map((c) => ({ value: c.id, label: `${c.name} (${c.issuer})` }))}
        value={selectedId}
        onChange={(value) => {
          if (value) handleSelect(value);
        }}
        disabled={loading}
      />
    </Paper>
  );
}
