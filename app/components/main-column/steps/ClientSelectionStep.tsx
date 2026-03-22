/**
 * Client selection step
 */
import { Paper, Select, Text, Stack, Badge } from "@mantine/core";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { ClientConfigStorage, fetchProviderMetadata } from "../../../lib/storage/client-config";
import { useState, useEffect } from "react";

const LAST_SELECTED_CLIENT_KEY = "oidc_last_selected_client";

export function ClientSelectionStep() {
  const { state, dispatch } = usePlayground();
  const [clients, setClients] = useState(ClientConfigStorage.getAll());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadedClients = ClientConfigStorage.getAll();
    setClients(loadedClients);

    if (loadedClients.length > 0 && !selectedId && state.currentStep <= 1) {
      // Auto-select: last selected or first client
      const lastSelectedId = localStorage.getItem(LAST_SELECTED_CLIENT_KEY);
      const clientToSelect = lastSelectedId
        ? loadedClients.find((c) => c.id === lastSelectedId) || loadedClients[0]
        : loadedClients[0];

      if (clientToSelect) {
        setSelectedId(clientToSelect.id);
        handleClientSelect(clientToSelect.id);
      }
    }
  }, []);

  const handleClientSelect = async (clientId: string | null) => {
    if (!clientId) return;

    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    setLoading(true);
    try {
      // Fetch provider metadata if not cached
      let metadata = client.metadata;
      if (!metadata) {
        metadata = await fetchProviderMetadata(client.issuer);
        // Update client with metadata
        ClientConfigStorage.save({ ...client, metadata });
      }

      // Save last selected client
      localStorage.setItem(LAST_SELECTED_CLIENT_KEY, clientId);

      dispatch({ type: "SELECT_CLIENT", payload: { ...client, metadata } });
      dispatch({ type: "SET_PROVIDER_METADATA", payload: metadata });

      // Auto-advance to next step
      if (state.currentStep === 1) {
        dispatch({ type: "ADVANCE_STEP" });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to fetch provider metadata",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string | null) => {
    setSelectedId(value);
    if (value) {
      handleClientSelect(value);
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
        onChange={handleChange}
        disabled={loading}
      />
    </Paper>
  );
}
