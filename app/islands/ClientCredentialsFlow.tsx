import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Timeline,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useFieldArray, useForm } from "react-hook-form";
import TokenDisplay from "./TokenDisplay";
import { AppShell } from "../components/AppShell";
import { useIssuers } from "../hooks/useIssuers";
import { useClients } from "../hooks/useClients";
import type { TokenResponse } from "../lib/oauth/types";

type FormValues = {
  issuerId: string;
  clientId: string;
  scopes: string[];
  resource: string;
  customParams: Array<{ key: string; value: string }>;
};

type ClientCredentialsFlowProps = {
  currentPath?: string;
};

const parseResources = (value: string): string[] => {
  return value
    .split(/[,\n\r\t ]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

type StepSettingsProps = {
  issuerOptions: Array<{ value: string; label: string }>;
  clientOptions: Array<{ value: string; label: string }>;
  issuerId: string;
  clientId: string;
  setValue: (name: keyof FormValues, value: FormValues[keyof FormValues]) => void;
  scopes: string[];
  scopeOptions: Array<{ value: string; label: string }>;
  onCreateScope: (value: string) => string;
  showGrantWarning: boolean;
  showClientSecretWarning: boolean;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  resourcesLabelProps: {
    label: string;
    description: string;
    placeholder: string;
  };
  customParams: Array<{ id: string; key: string; value: string }>;
  onAddParam: () => void;
  onRemoveParam: (index: number) => void;
};

const StepSettings = ({
  issuerOptions,
  clientOptions,
  issuerId,
  clientId,
  setValue,
  scopes,
  scopeOptions,
  onCreateScope,
  showGrantWarning,
  showClientSecretWarning,
  register,
  resourcesLabelProps,
  customParams,
  onAddParam,
  onRemoveParam,
}: StepSettingsProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={600}>Request Settings</Text>
        {scopes.length > 0 && (
          <Text size="xs" c="dimmed">
            Selected: {scopes.join(" ")}
          </Text>
        )}
      </Group>
      <Divider />
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Issuer & Client (registered in Settings)
        </Text>
        <Select
          label="Issuer"
          placeholder="Select issuer"
          data={issuerOptions}
          value={issuerId || null}
          onChange={(value) => setValue("issuerId", value || "")}
          searchable
          clearable
          size="sm"
        />
        <Select
          label="Client"
          placeholder={issuerId ? "Select client" : "Select issuer first"}
          data={clientOptions}
          value={clientId || null}
          onChange={(value) => setValue("clientId", value || "")}
          disabled={!issuerId}
          searchable
          clearable
          size="sm"
        />
        <Text size="xs" c="dimmed">
          Manage issuers and clients in Settings.
        </Text>
      </Stack>

      {showGrantWarning && (
        <Alert color="gray" title="Grant type warning">
          The selected issuer may not support the client_credentials grant type. Check the IdP
          documentation.
        </Alert>
      )}

      {showClientSecretWarning && (
        <Alert color="gray" title="Confidential client required">
          Client Credentials flow requires a client secret. Please select or register a
          confidential client.
        </Alert>
      )}

      <Divider />

      <Stack gap="sm">
        <Text fw={600} size="sm">
          Scopes (Optional)
        </Text>
        <Text size="sm" c="dimmed">
          Client credentials flow typically uses application-specific scopes.
        </Text>
        <MultiSelect
          label="scope"
          placeholder="Select scopes"
          data={scopeOptions}
          value={scopes}
          onChange={(value) => setValue("scopes", value, { shouldDirty: true })}
          searchable
          clearable
          size="sm"
          creatable
          getCreateLabel={(query) => `Add scope "${query}"`}
          onCreate={onCreateScope}
        />
      </Stack>

      <Divider />

      <Stack gap="sm">
        <Text fw={600} size="sm">
          Resource Indicator (RFC 8707)
        </Text>
        <Textarea
          label={resourcesLabelProps.label}
          description={resourcesLabelProps.description}
          placeholder={resourcesLabelProps.placeholder}
          minRows={3}
          {...register("resource")}
          size="sm"
        />
      </Stack>

      <Divider />

      <Stack gap="sm">
        <Text fw={600} size="sm">
          Custom Parameters
        </Text>
        {customParams.map((field, index) => (
          <Group key={field.id} align="flex-end">
            <TextInput
              label="key"
              placeholder="audience"
              {...register(`customParams.${index}.key` as const)}
              size="sm"
              style={{ flex: 1 }}
            />
            <TextInput
              label="value"
              placeholder="value"
              {...register(`customParams.${index}.value` as const)}
              size="sm"
              style={{ flex: 1 }}
            />
            <Button size="xs" variant="light" color="dark" onClick={() => onRemoveParam(index)}>
              Remove
            </Button>
          </Group>
        ))}
        <Button size="xs" variant="light" color="dark" onClick={onAddParam}>
          Add parameter
        </Button>
      </Stack>
    </Stack>
  </Card>
);

type StepConfigureRequestProps = {
  tokenCurlSample: string;
};

const StepConfigureRequest = ({ tokenCurlSample }: StepConfigureRequestProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Text fw={600}>Step 1: Configure request</Text>
      <Text size="sm" c="dimmed">
        Select issuer, client, and parameters before requesting a token.
      </Text>
      <Text size="xs" c="dimmed">
        cURL sample
      </Text>
      <Code block className="curl-block">
        {tokenCurlSample}
      </Code>
    </Stack>
  </Card>
);

type StepTokenRequestProps = {
  disabled: boolean;
  onRequest: () => void;
  isLoading: boolean;
  tokenCurlSample: string;
};

const StepTokenRequest = ({
  disabled,
  onRequest,
  isLoading,
  tokenCurlSample,
}: StepTokenRequestProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={600}>Step 2: Request token</Text>
        <Button color="dark" onClick={onRequest} loading={isLoading} disabled={disabled}>
          Request Access Token
        </Button>
      </Group>
      <Text size="xs" c="dimmed">
        cURL sample
      </Text>
      <Code block className="curl-block">
        {tokenCurlSample}
      </Code>
    </Stack>
  </Card>
);

export default function ClientCredentialsFlow({ currentPath }: ClientCredentialsFlowProps) {
  const { issuers } = useIssuers();
  const { getClientsByIssuerId } = useClients();

  const { setValue, watch, register, control } = useForm<FormValues>({
    defaultValues: {
      issuerId: "",
      clientId: "",
      scopes: [],
      resource: "",
      customParams: [{ key: "", value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customParams",
  });

  const issuerId = watch("issuerId");
  const clientId = watch("clientId");
  const scopes = watch("scopes");
  const resource = watch("resource");
  const customParams = watch("customParams");

  const selectedIssuer = useMemo(
    () => issuers.find((issuer) => issuer.id === issuerId) ?? null,
    [issuerId, issuers],
  );

  const issuerClients = useMemo(
    () => (issuerId ? getClientsByIssuerId(issuerId) : []),
    [getClientsByIssuerId, issuerId],
  );

  const selectedClient = useMemo(
    () => issuerClients.find((client) => client.id === clientId) ?? null,
    [clientId, issuerClients],
  );

  useEffect(() => {
    setValue("clientId", "");
  }, [issuerId, setValue]);

  // Flow state
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resources = useMemo(() => parseResources(resource), [resource]);

  // Available scopes from well-known
  const availableScopes = selectedIssuer?.wellKnown?.scopes_supported || [];
  const scopeOptions = useMemo(() => {
    const combined = new Set([...availableScopes, ...scopes]);
    return Array.from(combined).map((scope) => ({ value: scope, label: scope }));
  }, [availableScopes, scopes]);

  // Check if grant type is supported
  const supportsClientCredentials =
    selectedIssuer?.wellKnown?.grant_types_supported?.includes("client_credentials") ?? true;

  // Request tokens
  const handleRequestToken = async () => {
    if (!selectedIssuer || !selectedClient) {
      setError("Please select an issuer and client");
      return;
    }

    if (!selectedClient.clientSecret) {
      setError("Client Credentials flow requires a confidential client with a client secret");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenEndpoint: selectedIssuer.wellKnown.token_endpoint,
          grantType: "client_credentials",
          clientId: selectedClient.clientId,
          clientSecret: selectedClient.clientSecret,
          scopes: scopes.length > 0 ? scopes : undefined,
          resources: resources.length > 0 ? resources : undefined,
          additionalParams: customParams?.reduce<Record<string, string>>((acc, entry) => {
            if (entry.key && entry.value) {
              acc[entry.key] = entry.value;
            }
            return acc;
          }, {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || "Token request failed");
      }

      setTokenResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScope = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    const nextScopes = scopes.includes(trimmed) ? scopes : [...scopes, trimmed];
    setValue("scopes", nextScopes, { shouldDirty: true });
    return trimmed;
  };

  // Reset flow
  const handleReset = () => {
    setTokenResponse(null);
    setError(null);
  };

  useEffect(() => {
    handleReset();
  }, [issuerId, clientId]);

  const tokenCurlSample = useMemo(() => {
    if (!selectedIssuer || !selectedClient) {
      return "curl -X POST <token_endpoint> \\\n  -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=api:read\"";
    }

    const params = new URLSearchParams();
    params.set("grant_type", "client_credentials");
    params.set("client_id", selectedClient.clientId);
    params.set("client_secret", selectedClient.clientSecret || "<client_secret>");
    if (scopes.length > 0) {
      params.set("scope", scopes.join(" "));
    }
    if (resources.length > 0) {
      for (const item of resources) {
        params.append("resource", item);
      }
    }
    if (customParams) {
      for (const entry of customParams) {
        if (entry.key && entry.value) {
          params.set(entry.key, entry.value);
        }
      }
    }

    return `curl -X POST \"${selectedIssuer.wellKnown.token_endpoint}\" \\\n  -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"${params.toString()}\"`;
  }, [selectedIssuer, selectedClient, scopes, resources, customParams]);

  const issuerOptions = issuers.map((issuer) => ({ value: issuer.id, label: issuer.name }));
  const clientOptions = issuerClients.map((client) => ({
    value: client.id,
    label: `${client.name} (${client.clientId})`,
  }));
  const expectedIssuer = selectedIssuer?.wellKnown?.issuer ?? selectedIssuer?.issuer ?? undefined;

  const main = (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={2}>Client Credentials Flow</Title>
        <Text c="dimmed">
          Request access tokens for machine-to-machine authentication without end-user login.
        </Text>
      </Stack>

      {error && (
        <Alert icon={<IconAlertCircle size={18} />} color="dark" title="Flow error">
          {error}
        </Alert>
      )}

      <Group justify="space-between">
        <Text fw={600}>Flow Timeline</Text>
        <Button variant="light" color="dark" onClick={handleReset}>
          Clear Response
        </Button>
      </Group>

      <Timeline active={selectedClient ? 2 : 1} bulletSize={28} lineWidth={2}>
        <Timeline.Item
          title="Settings"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              1
            </Badge>
          }
        >
          <StepSettings
            issuerOptions={issuerOptions}
            clientOptions={clientOptions}
            issuerId={issuerId}
            clientId={clientId}
            setValue={setValue}
            scopes={scopes}
            scopeOptions={scopeOptions}
            onCreateScope={handleCreateScope}
            showGrantWarning={!supportsClientCredentials && Boolean(selectedIssuer)}
            showClientSecretWarning={Boolean(selectedClient && !selectedClient.clientSecret)}
            register={register}
            resourcesLabelProps={{
              label: "resource",
              description:
                "Space/comma/newline separated URIs. Multiple values will be sent as repeated resource parameters.",
              placeholder: "https://api.example.com\nhttps://vault.example.com",
            }}
            customParams={fields}
            onAddParam={() => append({ key: "", value: "" })}
            onRemoveParam={remove}
          />
        </Timeline.Item>

        <Timeline.Item
          title="Configure request"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              2
            </Badge>
          }
        >
          <StepConfigureRequest tokenCurlSample={tokenCurlSample} />
        </Timeline.Item>

        <Timeline.Item
          title="Request token"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              3
            </Badge>
          }
        >
          <StepTokenRequest
            disabled={!selectedIssuer || !selectedClient || !selectedClient.clientSecret}
            onRequest={handleRequestToken}
            isLoading={isLoading}
            tokenCurlSample={tokenCurlSample}
          />
        </Timeline.Item>
      </Timeline>
    </Stack>
  );

  const response = (
    <Stack gap="lg">
      <Title order={3}>Responses</Title>
      {tokenResponse ? (
        <TokenDisplay
          tokenResponse={tokenResponse}
          expectedIssuer={expectedIssuer}
          expectedAudience={selectedClient?.clientId}
        />
      ) : (
        <Card withBorder radius="md" p="md" className="flow-card">
          <Text size="sm" c="dimmed">
            No token response yet. Submit the token request to populate this panel.
          </Text>
        </Card>
      )}
    </Stack>
  );

  return <AppShell currentPath={currentPath} main={main} response={response} />;
}
