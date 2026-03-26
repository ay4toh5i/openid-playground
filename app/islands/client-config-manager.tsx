import { useState } from "react";
import {
  Stack,
  Card,
  Text,
  Button,
  TextInput,
  Select,
  Textarea,
  Group,
  ActionIcon,
  Title,
  Badge,
  Switch,
  Divider,
  Alert,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import {
  IconTrash,
  IconEdit,
  IconPlus,
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconDownload,
} from "@tabler/icons-react";
import {
  ClientConfigStorage,
  fetchProviderMetadata,
  type ClientConfig,
} from "../lib/storage/client-config";
import { generateECKeyPair, importECPrivateKeyJwk } from "../lib/crypto/key-management";

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
  dpop?: boolean;
};

interface ClientConfigManagerProps {
  onClose?: () => void;
}

function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ClientConfigManager({ onClose: _onClose }: ClientConfigManagerProps = {}) {
  const [clients, setClients] = useState<ClientConfig[]>(() => ClientConfigStorage.getAll());
  const [view, setView] = useState<"list" | "form">("list");
  const [editingClient, setEditingClient] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyGenLoading, setKeyGenLoading] = useState(false);

  // EC key pair state for private_key_jwt (not stored in form fields)
  const [privateKeyJwk, setPrivateKeyJwk] = useState<string | null>(null);
  const [privateKeyPublicJwk, setPrivateKeyPublicJwk] = useState<string | null>(null);

  // DPoP key pair state
  const [dpopPrivateKeyJwk, setDpopPrivateKeyJwk] = useState<string | null>(null);
  const [dpopPublicKeyJwk, setDpopPublicKeyJwk] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<ClientFormData>({
    defaultValues: {
      clientAuthenticationMethod: "client_secret_post",
      dpop: false,
    },
  });

  const authMethod = watch("clientAuthenticationMethod");
  const dpopEnabled = watch("dpop");

  const refreshClients = () => setClients(ClientConfigStorage.getAll());

  const resetKeyState = () => {
    setPrivateKeyJwk(null);
    setPrivateKeyPublicJwk(null);
    setDpopPrivateKeyJwk(null);
    setDpopPublicKeyJwk(null);
  };

  const openAddForm = () => {
    setEditingClient(null);
    resetKeyState();
    reset({
      name: "",
      issuer: "",
      clientId: "",
      clientAuthenticationMethod: "client_secret_post",
      clientSecret: "",
      dpop: false,
    });
    setView("form");
  };

  const openEditForm = (client: ClientConfig) => {
    setEditingClient(client);
    // Restore key state from saved client
    setPrivateKeyJwk(client.privateKeyJwk ?? null);
    setPrivateKeyPublicJwk(client.privateKeyPublicJwk ?? null);
    setDpopPrivateKeyJwk(client.dpopPrivateKeyJwk ?? null);
    setDpopPublicKeyJwk(client.dpopPublicKeyJwk ?? null);
    reset({
      name: client.name,
      issuer: client.issuer,
      clientId: client.clientId,
      clientAuthenticationMethod: client.clientAuthenticationMethod,
      clientSecret: client.clientSecret ?? "",
      dpop: client.dpop ?? false,
    });
    setView("form");
  };

  const importKeyFromFile = (onImport: (jwk: JsonWebKey) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jwk,.json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const jwk = JSON.parse(text) as JsonWebKey;
        onImport(jwk);
      } catch {
        alert("Failed to read file: invalid JSON");
      }
    };
    input.click();
  };

  const handleImportPrivateKeyJwt = () => {
    importKeyFromFile(async (jwk) => {
      try {
        const { privateKeyJwk: priv, publicKeyJwk: pub } = await importECPrivateKeyJwk(jwk);
        setPrivateKeyJwk(JSON.stringify(priv, null, 2));
        setPrivateKeyPublicJwk(JSON.stringify(pub, null, 2));
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  };

  const handleImportDPoPKey = () => {
    importKeyFromFile(async (jwk) => {
      try {
        const { privateKeyJwk: priv, publicKeyJwk: pub } = await importECPrivateKeyJwk(jwk);
        setDpopPrivateKeyJwk(JSON.stringify(priv, null, 2));
        setDpopPublicKeyJwk(JSON.stringify(pub, null, 2));
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  };

  const handleGeneratePrivateKeyJwt = async () => {
    setKeyGenLoading(true);
    try {
      const { privateKeyJwk: priv, publicKeyJwk: pub } = await generateECKeyPair();
      const privStr = JSON.stringify(priv, null, 2);
      const pubStr = JSON.stringify(pub, null, 2);
      setPrivateKeyJwk(privStr);
      setPrivateKeyPublicJwk(pubStr);
    } catch (error) {
      alert(`Key generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setKeyGenLoading(false);
    }
  };

  const handleGenerateDPoPKeyPair = async () => {
    setKeyGenLoading(true);
    try {
      const { privateKeyJwk: priv, publicKeyJwk: pub } = await generateECKeyPair();
      setDpopPrivateKeyJwk(JSON.stringify(priv, null, 2));
      setDpopPublicKeyJwk(JSON.stringify(pub, null, 2));
    } catch (error) {
      alert(
        `DPoP key generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setKeyGenLoading(false);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const metadata = await fetchProviderMetadata(data.issuer);
      const clientData: Omit<ClientConfig, "id" | "createdAt" | "updatedAt"> = {
        name: data.name,
        issuer: data.issuer,
        clientId: data.clientId,
        clientAuthenticationMethod: data.clientAuthenticationMethod,
        clientSecret: data.clientSecret || undefined,
        privateKeyJwk: privateKeyJwk ?? undefined,
        privateKeyPublicJwk: privateKeyPublicJwk ?? undefined,
        dpop: data.dpop ?? false,
        dpopPrivateKeyJwk: data.dpop && dpopPrivateKeyJwk ? dpopPrivateKeyJwk : undefined,
        dpopPublicKeyJwk: data.dpop && dpopPublicKeyJwk ? dpopPublicKeyJwk : undefined,
        metadata,
      };
      if (editingClient) {
        ClientConfigStorage.save({ ...clientData, id: editingClient.id } as ClientConfig);
      } else {
        ClientConfigStorage.save(clientData);
      }
      refreshClients();
      setView("list");
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

  if (view === "form") {
    return (
      <div style={{ padding: "24px" }}>
        <Stack gap="lg">
          <Group>
            <ActionIcon variant="subtle" onClick={() => setView("list")} aria-label="Back to list">
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Title order={3}>
              {editingClient ? "Edit Client Configuration" : "Add Client Configuration"}
            </Title>
          </Group>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Name"
                {...register("name")}
                required
                placeholder="My OAuth Client"
              />

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
                <Stack gap="sm">
                  <Divider label="Private Key JWT — EC Key Pair (ES256)" labelPosition="left" />

                  <Group gap="sm">
                    <Button
                      variant="light"
                      loading={keyGenLoading}
                      onClick={handleGeneratePrivateKeyJwt}
                    >
                      {privateKeyJwk ? "Regenerate EC Key Pair" : "Generate EC Key Pair (ES256)"}
                    </Button>
                    <Button variant="subtle" onClick={handleImportPrivateKeyJwt}>
                      Import Private Key (JWK)
                    </Button>
                  </Group>

                  {privateKeyPublicJwk && (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Public Key JWK{" "}
                        <Text span size="xs" c="dimmed">
                          (register this at your provider's JWKS endpoint)
                        </Text>
                      </Text>
                      <Textarea
                        value={privateKeyPublicJwk}
                        readOnly
                        minRows={4}
                        styles={{ input: { fontFamily: "monospace", fontSize: "11px" } }}
                      />
                      <Group gap="xs">
                        <CopyButton value={privateKeyPublicJwk}>
                          {({ copied, copy }) => (
                            <Button
                              variant="subtle"
                              size="xs"
                              leftSection={
                                copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                              }
                              onClick={copy}
                              color={copied ? "teal" : "blue"}
                            >
                              {copied ? "Copied" : "Copy Public Key"}
                            </Button>
                          )}
                        </CopyButton>
                        <Tooltip label="Download as .jwk file">
                          <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconDownload size={14} />}
                            onClick={() =>
                              downloadJson(privateKeyPublicJwk, "private-key-jwt-public-key.jwk")
                            }
                          >
                            Export Public Key
                          </Button>
                        </Tooltip>
                      </Group>
                    </Stack>
                  )}

                  {privateKeyJwk && (
                    <Alert color="green" variant="light">
                      EC key pair generated. Private key stored securely.
                    </Alert>
                  )}
                </Stack>
              )}

              <Divider label="DPoP" labelPosition="left" />

              <Switch
                label="Use DPoP (Demonstrating Proof of Possession)"
                {...register("dpop")}
                checked={dpopEnabled}
                onChange={(e) => setValue("dpop", e.currentTarget.checked)}
              />

              {dpopEnabled && (
                <Stack gap="sm">
                  <Group gap="sm">
                    <Button
                      variant="light"
                      loading={keyGenLoading}
                      onClick={handleGenerateDPoPKeyPair}
                    >
                      {dpopPublicKeyJwk ? "Regenerate DPoP Key Pair" : "Generate DPoP Key Pair"}
                    </Button>
                    <Button variant="subtle" onClick={handleImportDPoPKey}>
                      Import Private Key (JWK)
                    </Button>
                  </Group>

                  {dpopPublicKeyJwk ? (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        DPoP Public Key JWK
                      </Text>
                      <Textarea
                        value={dpopPublicKeyJwk}
                        readOnly
                        minRows={4}
                        styles={{ input: { fontFamily: "monospace", fontSize: "11px" } }}
                      />
                      <Group gap="xs">
                        <CopyButton value={dpopPublicKeyJwk}>
                          {({ copied, copy }) => (
                            <Button
                              variant="subtle"
                              size="xs"
                              leftSection={
                                copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                              }
                              onClick={copy}
                              color={copied ? "teal" : "blue"}
                            >
                              {copied ? "Copied" : "Copy Public Key"}
                            </Button>
                          )}
                        </CopyButton>
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconDownload size={14} />}
                          onClick={() => downloadJson(dpopPublicKeyJwk, "dpop-public-key.jwk")}
                        >
                          Export Public Key
                        </Button>
                      </Group>
                      <Alert color="green" variant="light">
                        DPoP key pair configured. Proof JWTs will be generated automatically for
                        each token request.
                      </Alert>
                    </Stack>
                  ) : (
                    <Alert color="yellow" variant="light">
                      Generate a DPoP key pair to enable DPoP for token requests.
                    </Alert>
                  )}
                </Stack>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => setView("list")}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {editingClient ? "Update" : "Add"} Client
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </div>
    );
  }

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
          <Button leftSection={<IconPlus size={16} />} onClick={openAddForm}>
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
                <Button variant="light" onClick={openAddForm}>
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
                      {client.dpop && (
                        <Badge size="sm" variant="light" color="violet">
                          DPoP
                        </Badge>
                      )}
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
                      onClick={() => openEditForm(client)}
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
    </div>
  );
}
