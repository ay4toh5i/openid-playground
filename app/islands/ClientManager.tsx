import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react";
import { useClients } from "../hooks/useClients";
import type { Issuer } from "../lib/oauth/types";

interface ClientManagerProps {
  issuer: Issuer | null;
}

export default function ClientManager({ issuer }: ClientManagerProps) {
  const { isLoading, addClient, deleteClient, getClientsByIssuerId } = useClients();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const issuerClients = issuer ? getClientsByIssuerId(issuer.id) : [];

  const handleAddClient = () => {
    if (!issuer) {
      setError("Please select an issuer first");
      return;
    }

    if (!name.trim() || !clientId.trim()) {
      setError("Name and Client ID are required");
      return;
    }

    setError(null);
    addClient(name.trim(), issuer.id, clientId.trim(), clientSecret.trim() || undefined);
    setName("");
    setClientId("");
    setClientSecret("");
  };

  const toggleShowSecret = (id: string) => {
    setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <Text size="sm" c="dimmed">Loading...</Text>;
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Clients</Text>
      </Group>

      {!issuer ? (
        <Text size="sm" c="dimmed">
          Select an issuer to manage clients.
        </Text>
      ) : (
        <>
          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Adding client for: <strong>{issuer.name}</strong>
              </Text>
              <TextInput
                label="Client name"
                placeholder="My Web App"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
              />
              <TextInput
                label="Client ID"
                placeholder="client_id"
                value={clientId}
                onChange={(event) => setClientId(event.currentTarget.value)}
              />
              <TextInput
                label="Client secret"
                placeholder="optional for public clients"
                type="password"
                value={clientSecret}
                onChange={(event) => setClientSecret(event.currentTarget.value)}
              />
              {error && (
                <Text size="xs" c="red">
                  {error}
                </Text>
              )}
              <Button onClick={handleAddClient}>Add Client</Button>
            </Stack>
          </Card>

          <Stack gap="sm">
            {issuerClients.length === 0 ? (
              <Text size="sm" c="dimmed">
                No clients registered for this issuer.
              </Text>
            ) : (
              issuerClients.map((client) => (
                <Card key={client.id} withBorder radius="md" p="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text fw={600}>{client.name}</Text>
                      <Text size="sm" c="dimmed">
                        {client.clientId}
                      </Text>
                      {client.clientSecret ? (
                        <Group gap="xs">
                          <Badge color="gray" variant="light">
                            Confidential
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {showSecret[client.id] ? client.clientSecret : "••••••••"}
                          </Text>
                          <ActionIcon
                            variant="light"
                            aria-label="Toggle secret"
                            onClick={() => toggleShowSecret(client.id)}
                          >
                            {showSecret[client.id] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </ActionIcon>
                        </Group>
                      ) : (
                        <Badge color="dark" variant="light">
                          Public
                        </Badge>
                      )}
                    </Stack>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label="Delete"
                      onClick={() => deleteClient(client.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
