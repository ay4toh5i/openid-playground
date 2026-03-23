import { Paper, Select, Text, Stack, Alert } from "@mantine/core";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  ClientConfigStorage,
  fetchProviderMetadata,
  type ClientConfig,
  type OIDCProviderMetadata,
} from "../../../lib/storage/client-config";

const LAST_SELECTED_CLIENT_KEY = "oidc_last_selected_client";

interface ClientSelectionStepProps {
  onClientSelected: (client: ClientConfig, metadata: OIDCProviderMetadata) => void;
}

export function ClientSelectionStep({ onClientSelected }: ClientSelectionStepProps) {
  const [clients] = useState(() => ClientConfigStorage.getAll());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) {
        throw new Error("Client not found");
      }
      let metadata = client.metadata;
      if (!metadata) {
        metadata = await fetchProviderMetadata(client.issuer);
        ClientConfigStorage.save({ ...client, metadata });
      }
      localStorage.setItem(LAST_SELECTED_CLIENT_KEY, clientId);
      return { client: { ...client, metadata } as ClientConfig, metadata };
    },
    onSuccess: ({ client, metadata }) => {
      onClientSelected(client, metadata);
    },
  });

  // Auto-select last used or first client on mount
  useEffect(() => {
    if (clients.length === 0) {
      return;
    }
    const lastSelectedId = localStorage.getItem(LAST_SELECTED_CLIENT_KEY);
    const initialClient =
      (lastSelectedId ? clients.find((c) => c.id === lastSelectedId) : null) ?? clients[0];
    if (initialClient) {
      setSelectedId(initialClient.id);
      mutation.mutate(initialClient.id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Stack gap="sm">
        <Select
          label="Select OAuth Client"
          placeholder="Choose a client"
          data={clients.map((c) => ({ value: c.id, label: `${c.name} (${c.issuer})` }))}
          value={selectedId}
          onChange={(value) => {
            if (value) {
              setSelectedId(value);
              mutation.mutate(value);
            }
          }}
          disabled={mutation.isPending}
        />
        {mutation.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Failed to fetch provider metadata"}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
