import { useState } from "react";
import {
  Stack,
  Card,
  Text,
  Button,
  Modal,
  TextInput,
  Select,
  Textarea,
  Group,
  ActionIcon,
  Title,
  Badge,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { IconTrash, IconEdit, IconPlus } from "@tabler/icons-react";
import {
  ClientConfigStorage,
  fetchProviderMetadata,
  type ClientConfig,
} from "../lib/storage/client-config";

type ClientFormData = {
  name: string;
  issuer: string;
  clientId: string;
  clientAuthenticationMethod:
    | "none"
    | "client_secret_basic"
    | "client_secret_post"
    | "private_key_jwt";
  clientSecret?: string;
  privateKey?: string;
};

interface ClientConfigManagerProps {
  onClose?: () => void;
}

export default function ClientConfigManager({ onClose: _onClose }: ClientConfigManagerProps = {}) {
  const [clients, setClients] = useState<ClientConfig[]>(() => ClientConfigStorage.getAll());
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<ClientFormData>({
    defaultValues: {
      clientAuthenticationMethod: "client_secret_post",
    },
  });

  const authMethod = watch("clientAuthenticationMethod");

  const refreshClients = () => setClients(ClientConfigStorage.getAll());

  const openAddModal = () => {
    setEditingClient(null);
    reset({
      name: "",
      issuer: "",
      clientId: "",
      clientAuthenticationMethod: "client_secret_post",
      clientSecret: "",
      privateKey: "",
    });
    setModalOpened(true);
  };

  const openEditModal = (client: ClientConfig) => {
    setEditingClient(client);
    reset({
      name: client.name,
      issuer: client.issuer,
      clientId: client.clientId,
      clientAuthenticationMethod: client.clientAuthenticationMethod,
      clientSecret: client.clientSecret ?? "",
      privateKey: client.privateKey ?? "",
    });
    setModalOpened(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const metadata = await fetchProviderMetadata(data.issuer);
      const clientData = {
        name: data.name,
        issuer: data.issuer,
        clientId: data.clientId,
        clientAuthenticationMethod: data.clientAuthenticationMethod,
        clientSecret: data.clientSecret,
        privateKey: data.privateKey,
        metadata,
      };
      if (editingClient) {
        ClientConfigStorage.save({ ...clientData, id: editingClient.id } as ClientConfig);
      } else {
        ClientConfigStorage.save(clientData);
      }
      refreshClients();
      setModalOpened(false);
    } catch (error) {
      alert(`Failed to save client: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client configuration?")) {
      ClientConfigStorage.delete(id);
      refreshClients();
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>OAuth Client Configurations</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Manage your OAuth/OIDC client credentials
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
            Add Client
          </Button>
        </Group>

        <Stack gap="md">
          {clients.length === 0 ? (
            <Card withBorder padding="xl">
              <Stack align="center" gap="sm">
                <Text size="sm" c="dimmed">
                  No client configurations yet
                </Text>
                <Button variant="light" onClick={openAddModal}>
                  Add Your First Client
                </Button>
              </Stack>
            </Card>
          ) : (
            clients.map((client) => (
              <Card key={client.id} withBorder padding="md">
                <Group justify="space-between">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="sm">
                      <Text fw={600}>{client.name}</Text>
                      <Badge size="sm" variant="light">
                        {client.clientAuthenticationMethod}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {client.issuer}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Client ID: {client.clientId}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => openEditModal(client)}
                      aria-label="Edit client"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(client.id)}
                      aria-label="Delete client"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingClient ? "Edit Client Configuration" : "Add Client Configuration"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput label="Name" {...register("name")} required placeholder="My OAuth Client" />

            <TextInput
              label="Issuer URL"
              {...register("issuer")}
              required
              placeholder="https://accounts.google.com"
            />

            <TextInput label="Client ID" {...register("clientId")} required />

            <Select
              label="Client Authentication Method"
              data={[
                { value: "none", label: "None (Public Client)" },
                { value: "client_secret_basic", label: "Client Secret Basic" },
                { value: "client_secret_post", label: "Client Secret Post" },
                { value: "private_key_jwt", label: "Private Key JWT" },
              ]}
              value={authMethod}
              onChange={(value) =>
                setValue(
                  "clientAuthenticationMethod",
                  value as ClientFormData["clientAuthenticationMethod"],
                )
              }
            />

            {(authMethod === "client_secret_basic" || authMethod === "client_secret_post") && (
              <TextInput
                label="Client Secret"
                {...register("clientSecret")}
                required
                type="password"
              />
            )}

            {authMethod === "private_key_jwt" && (
              <Textarea
                label="Private Key (PEM)"
                {...register("privateKey")}
                required
                minRows={4}
                placeholder="-----BEGIN PRIVATE KEY-----"
              />
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {editingClient ? "Update" : "Add"} Client
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
