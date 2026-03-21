import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Divider,
  Group,
  MultiSelect,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useFieldArray, useForm } from "react-hook-form";
import TokenDisplay from "./TokenDisplay";
import { AppShell } from "../components/AppShell";
import { useIssuers } from "../hooks/useIssuers";
import { useClients } from "../hooks/useClients";
import type { TokenResponse, PKCEMethod } from "../lib/oauth/types";
import { generatePKCE, generateState, generateNonce } from "../lib/oauth/pkce";
import { buildAuthorizationUrl, getRedirectUri } from "../lib/oauth/authorization-url";

type PromptValue = "none" | "login" | "consent" | "select_account";

type FormValues = {
  issuerId: string;
  clientId: string;
  scopes: string[];
  resource: string;
  usePKCE: boolean;
  pkceMethod: PKCEMethod;
  useNonce: boolean;
  prompt: PromptValue | "";
  loginHint: string;
  acrValues: string;
  uiLocales: string;
  maxAge: string;
  customParams: Array<{ key: string; value: string }>;
};

type AuthCodeFlowProps = {
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
  state: string | null;
  onRegenerateState: () => void;
  scopes: string[];
  scopeOptions: Array<{ value: string; label: string }>;
  onCreateScope: (value: string) => string;
  usePKCE: boolean;
  pkceMethod: PKCEMethod;
  onTogglePkce: (value: boolean) => void;
  onSetPkceMethod: (value: PKCEMethod) => void;
  supportedCodeChallengeMethods: string[];
  codeVerifier: string | null;
  codeChallenge: string | null;
  onRegeneratePkce: () => void;
  useNonce: boolean;
  onToggleNonce: (value: boolean) => void;
  nonce: string | null;
  onRegenerateNonce: () => void;
  prompt: PromptValue | "";
  onSetPrompt: (value: PromptValue | "") => void;
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

type StepRedirectUriProps = {
  redirectUri: string;
};

const StepRedirectUri = ({ redirectUri }: StepRedirectUriProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={600} size="sm">
          Redirect URI
        </Text>
        <CopyButton value={redirectUri || ""} timeout={800}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} position="top">
              <ActionIcon variant="light" color="dark" onClick={copy}>
                {copied ? "✓" : "⧉"}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <TextInput value={redirectUri || "<redirect_uri>"} readOnly size="sm" />
    </Stack>
  </Card>
);

const StepSettings = ({
  issuerOptions,
  clientOptions,
  issuerId,
  clientId,
  setValue,
  state,
  onRegenerateState,
  scopes,
  scopeOptions,
  onCreateScope,
  usePKCE,
  pkceMethod,
  onTogglePkce,
  onSetPkceMethod,
  supportedCodeChallengeMethods,
  codeVerifier,
  codeChallenge,
  onRegeneratePkce,
  useNonce,
  onToggleNonce,
  nonce,
  onRegenerateNonce,
  prompt,
  onSetPrompt,
  register,
  resourcesLabelProps,
  customParams,
  onAddParam,
  onRemoveParam,
}: StepSettingsProps) => {
  return (
    <Card withBorder radius="md" p="md" className="flow-card">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>Request Settings</Text>
          <Text size="xs" c="dimmed">
            OAuth 2.0 / OIDC Core + RFC 7636 (PKCE) + RFC 8707 (resource)
          </Text>
        </Group>

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

        <Divider />

        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              state
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="light" color="dark" onClick={onRegenerateState}>
                Regenerate
              </Button>
              <CopyButton value={state || ""} timeout={800}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"} position="top">
                    <ActionIcon variant="light" color="dark" onClick={copy}>
                      {copied ? "✓" : "⧉"}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Group>
          <TextInput value={state || ""} readOnly size="sm" />
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Text fw={600} size="sm">
            Scopes
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
            PKCE (RFC 7636)
          </Text>
          <Switch
            label="Enable PKCE"
            checked={usePKCE}
            onChange={(event) => onTogglePkce(event.currentTarget.checked)}
          />
          {usePKCE && (
            <Group gap="xs" wrap="wrap">
              {(["S256", "plain"] as const).map((method) => (
                <Badge
                  key={method}
                  color="dark"
                  variant={pkceMethod === method ? "filled" : "light"}
                  onClick={() => onSetPkceMethod(method)}
                  style={{ cursor: "pointer" }}
                >
                  {method}
                </Badge>
              ))}
            </Group>
          )}
          {supportedCodeChallengeMethods.length > 0 && (
            <Text size="xs" c="dimmed">
              IdP supports: {supportedCodeChallengeMethods.join(", ")}
            </Text>
          )}
          <Card withBorder radius="md" p="md" className="flow-card">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  code_verifier
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    color="dark"
                    onClick={onRegeneratePkce}
                    disabled={!usePKCE}
                  >
                    Regenerate
                  </Button>
                  <CopyButton value={codeVerifier || ""} timeout={800}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy"} position="top">
                        <ActionIcon variant="light" color="dark" onClick={copy}>
                          {copied ? "✓" : "⧉"}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Group>
              <TextInput value={codeVerifier || ""} readOnly size="sm" />
            </Stack>
          </Card>
          <Card withBorder radius="md" p="md" className="flow-card">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  code_challenge
                </Text>
                <CopyButton value={codeChallenge || ""} timeout={800}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied" : "Copy"} position="top">
                      <ActionIcon variant="light" color="dark" onClick={copy}>
                        {copied ? "✓" : "⧉"}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <TextInput value={codeChallenge || ""} readOnly size="sm" />
            </Stack>
          </Card>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Text fw={600} size="sm">
            OpenID Connect
          </Text>
          <Switch
            label="Include nonce"
            checked={useNonce}
            onChange={(event) => onToggleNonce(event.currentTarget.checked)}
          />
          <Card withBorder radius="md" p="md" className="flow-card">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  nonce
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    color="dark"
                    onClick={onRegenerateNonce}
                    disabled={!useNonce}
                  >
                    Regenerate
                  </Button>
                  <CopyButton value={nonce || ""} timeout={800}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy"} position="top">
                        <ActionIcon variant="light" color="dark" onClick={copy}>
                          {copied ? "✓" : "⧉"}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Group>
              <TextInput value={nonce || ""} readOnly size="sm" />
            </Stack>
          </Card>
          <Select
            label="prompt"
            placeholder="Select prompt"
            value={prompt || null}
            onChange={(value) => onSetPrompt((value ?? "") as PromptValue | "")}
            data={[
              { value: "", label: "default (no prompt parameter)" },
              { value: "none", label: "none (no UI)" },
              { value: "login", label: "login (force re-auth)" },
              { value: "consent", label: "consent (force consent)" },
              { value: "select_account", label: "select_account (choose account)" },
            ]}
            clearable
            size="sm"
          />
          <TextInput
            label="login_hint"
            placeholder="user@example.com"
            {...register("loginHint")}
            size="sm"
          />
          <TextInput
            label="acr_values"
            placeholder="urn:mace:incommon:iap:silver"
            {...register("acrValues")}
            size="sm"
          />
          <TextInput label="ui_locales" placeholder="en ja" {...register("uiLocales")} size="sm" />
          <TextInput label="max_age" placeholder="e.g., 3600" {...register("maxAge")} size="sm" />
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
                placeholder="claims"
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
};

type StepAuthorizeRequestProps = {
  disabled: boolean;
  onStart: () => void;
  onPrepare: () => void;
  authorizationUrl: string | null;
  formattedAuthorizationUrl: string;
};

const StepAuthorizeRequest = ({
  disabled,
  onStart,
  onPrepare,
  authorizationUrl,
  formattedAuthorizationUrl,
}: StepAuthorizeRequestProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={600}>Start Flow</Text>
        <Button variant="light" color="dark" onClick={onPrepare} disabled={disabled}>
          Prepare URL
        </Button>
      </Group>
      <Text size="xs" c="dimmed">
        Start URL
      </Text>
      <Text size="xs" c="dimmed">
        Parameters are split per line for readability.
      </Text>
      <Code block className="url-block">
        {formattedAuthorizationUrl}
      </Code>
      <Group justify="center">
        <Button color="dark" onClick={onStart} disabled={!authorizationUrl}>
          Run
        </Button>
      </Group>
    </Stack>
  </Card>
);

type StepAuthorizeResponseProps = {
  expectedState: string | null;
  callbackState: string | null;
  expectedIssuer: string | null;
  callbackIssuer: string | null;
  authorizationCode: string | null;
};

const StepAuthorizeResponse = ({
  expectedState,
  callbackState,
  expectedIssuer,
  callbackIssuer,
  authorizationCode,
}: StepAuthorizeResponseProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Text fw={600}>Authorize Response</Text>
      <Text size="xs" c="dimmed">
        The IdP redirects back to /callback and posts the authorization code.
      </Text>
      <Group gap="xs" wrap="wrap">
        <Badge color="dark" variant="light">
          state: {callbackState ? (callbackState === expectedState ? "valid" : "mismatch") : "missing"}
        </Badge>
        <Badge color="dark" variant="light">
          iss:{" "}
          {callbackIssuer
            ? callbackIssuer === expectedIssuer
              ? "valid"
              : "mismatch"
            : "missing"}
        </Badge>
      </Group>
      {authorizationCode ? (
        <Text size="xs" style={{ wordBreak: "break-all" }}>
          {authorizationCode}
        </Text>
      ) : (
        <Text size="xs" c="dimmed">
          Awaiting authorization response.
        </Text>
      )}
    </Stack>
  </Card>
);

type StepTokenRequestProps = {
  disabled: boolean;
  onExchange: () => void;
  isLoading: boolean;
  tokenCurlSample: string;
};

const StepTokenRequest = ({
  disabled,
  onExchange,
  isLoading,
  tokenCurlSample,
}: StepTokenRequestProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={600}>Token Request</Text>
        <Button color="dark" onClick={onExchange} loading={isLoading} disabled={disabled}>
          Exchange Code
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

type StepTokenResponseProps = {
  hasResponse: boolean;
};

const StepTokenResponse = ({ hasResponse }: StepTokenResponseProps) => (
  <Card withBorder radius="md" p="md" className="flow-card">
    <Stack gap="sm">
      <Text fw={600}>Token Response</Text>
      {hasResponse ? (
        <Text size="sm" c="dimmed">
          Tokens received. See details in the response panel.
        </Text>
      ) : (
        <Text size="sm" c="dimmed">
          No token response yet.
        </Text>
      )}
    </Stack>
  </Card>
);

export default function AuthCodeFlow({ currentPath }: AuthCodeFlowProps) {
  const { issuers } = useIssuers();
  const { getClientsByIssuerId } = useClients();

  const { setValue, watch, register, control } = useForm<FormValues>({
    defaultValues: {
      issuerId: "",
      clientId: "",
      scopes: ["openid"],
      resource: "",
      usePKCE: true,
      pkceMethod: "S256",
      useNonce: true,
      prompt: "",
      loginHint: "",
      acrValues: "",
      uiLocales: "",
      maxAge: "",
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
  const usePKCE = watch("usePKCE");
  const pkceMethod = watch("pkceMethod");
  const useNonce = watch("useNonce");
  const prompt = watch("prompt");
  const loginHint = watch("loginHint");
  const acrValues = watch("acrValues");
  const uiLocales = watch("uiLocales");
  const maxAge = watch("maxAge");
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
  const [state, setState] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [codeChallenge, setCodeChallenge] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [callbackState, setCallbackState] = useState<string | null>(null);
  const [callbackIssuer, setCallbackIssuer] = useState<string | null>(null);
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [tokenMeta, setTokenMeta] = useState<{
    status: number;
    headers: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");

  const resources = useMemo(() => parseResources(resource), [resource]);

  // Available scopes from well-known
  const availableScopes = selectedIssuer?.wellKnown?.scopes_supported || [];
  const supportedCodeChallengeMethods =
    selectedIssuer?.wellKnown?.code_challenge_methods_supported || [];
  const defaultScopes = ["openid", "profile", "email", "offline_access"];
  const scopeOptions = useMemo(() => {
    const combined = new Set([...defaultScopes, ...availableScopes, ...scopes]);
    return Array.from(combined).map((scope) => ({ value: scope, label: scope }));
  }, [availableScopes, scopes]);

  // Handle OAuth callback message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;

      const { code, state: returnedState, iss, error: callbackError, errorDescription } = event.data;

      if (callbackError) {
        setError(`${callbackError}: ${errorDescription || ""}`);
        return;
      }

      if (code) {
        setAuthorizationCode(code);
        setError(null);
      }
      setCallbackState(returnedState ?? null);
      setCallbackIssuer(iss ?? null);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Generate authorization URL
  const handlePrepareFlow = useCallback(async () => {
    if (!selectedIssuer || !selectedClient) {
      setError("Please select an issuer and client");
      return;
    }

    setError(null);
    const newState = generateState();
    setState(newState);

    let newCodeChallenge: string | undefined;
    let newCodeVerifier: string | undefined;

    if (usePKCE) {
      const pkce = await generatePKCE(pkceMethod);
      newCodeVerifier = pkce.codeVerifier;
      newCodeChallenge = pkce.codeChallenge;
      setCodeVerifier(newCodeVerifier);
      setCodeChallenge(newCodeChallenge);
    } else {
      setCodeVerifier(null);
      setCodeChallenge(null);
    }

    let newNonce: string | undefined;
    if (useNonce && scopes.includes("openid")) {
      newNonce = generateNonce();
      setNonce(newNonce);
    } else {
      setNonce(null);
    }

    const mergedParams: Record<string, string> = {};
    if (maxAge) {
      mergedParams.max_age = maxAge;
    }
    for (const entry of customParams || []) {
      if (entry.key && entry.value) {
        mergedParams[entry.key] = entry.value;
      }
    }

    const url = buildAuthorizationUrl({
      authorizationEndpoint: selectedIssuer.wellKnown.authorization_endpoint,
      clientId: selectedClient.clientId,
      redirectUri: getRedirectUri(),
      scopes,
      state: newState,
      codeChallenge: usePKCE ? newCodeChallenge : undefined,
      codeChallengeMethod: usePKCE ? pkceMethod : undefined,
      nonce: newNonce,
      prompt: prompt || undefined,
      loginHint: loginHint || undefined,
      acrValues: acrValues || undefined,
      uiLocales: uiLocales || undefined,
      additionalParams: Object.keys(mergedParams).length > 0 ? mergedParams : undefined,
      resources: resources.length > 0 ? resources : undefined,
    });

    setAuthorizationUrl(url);
    setAuthorizationCode(null);
    setCallbackState(null);
    setCallbackIssuer(null);
    setTokenResponse(null);
  }, [
    selectedIssuer,
    selectedClient,
    scopes,
    usePKCE,
    pkceMethod,
    useNonce,
    prompt,
    loginHint,
    acrValues,
    uiLocales,
    maxAge,
    customParams,
    resources,
  ]);

  const resetPreparedArtifacts = () => {
    setAuthorizationUrl(null);
    setAuthorizationCode(null);
    setCallbackState(null);
    setCallbackIssuer(null);
    setTokenResponse(null);
    setTokenMeta(null);
  };

  const handleRegenerateState = () => {
    setState(generateState());
    resetPreparedArtifacts();
  };

  const handleRegenerateNonce = () => {
    setNonce(generateNonce());
    resetPreparedArtifacts();
  };

  const handleRegeneratePkce = async () => {
    const pkce = await generatePKCE(pkceMethod);
    setCodeVerifier(pkce.codeVerifier);
    setCodeChallenge(pkce.codeChallenge);
    resetPreparedArtifacts();
  };
  // Start authorization flow
  const handleStartFlow = () => {
    if (!authorizationUrl) return;
    window.open(authorizationUrl, "oauth-popup", "width=600,height=700");
  };

  // Exchange code for tokens
  const handleExchangeToken = async () => {
    if (!selectedIssuer || !selectedClient || !authorizationCode) {
      setError("Missing required data for token exchange");
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
          grantType: "authorization_code",
          clientId: selectedClient.clientId,
          clientSecret: selectedClient.clientSecret,
          code: authorizationCode,
          redirectUri: getRedirectUri(),
          codeVerifier: codeVerifier || undefined,
          resources: resources.length > 0 ? resources : undefined,
        }),
      });

      const data = await response.json();
      const meta = data?._meta;
      if (meta?.status && meta?.headers) {
        setTokenMeta(meta);
      }

      if (!response.ok) {
        throw new Error(data.error_description || data.error || "Token exchange failed");
      }

      const { _meta, ...payload } = data ?? {};
      setTokenResponse(payload as TokenResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token exchange failed");
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
    setState(null);
    setCodeVerifier(null);
    setCodeChallenge(null);
    setNonce(null);
    setAuthorizationUrl(null);
    setAuthorizationCode(null);
    setCallbackState(null);
    setCallbackIssuer(null);
    setTokenResponse(null);
    setTokenMeta(null);
    setError(null);
  };

  useEffect(() => {
    handleReset();
  }, [issuerId, clientId]);

  useEffect(() => {
    setRedirectUri(getRedirectUri());
  }, []);

  const formattedAuthorizationUrl = useMemo(() => {
    if (!selectedIssuer || !selectedClient) {
      return "<authorization_endpoint>?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid&state=<state>";
    }

    const base = selectedIssuer.wellKnown.authorization_endpoint;
    const scopeValue = scopes.length > 0 ? scopes.join(" ") : "openid";
    const redirectUri = getRedirectUri() || "<redirect_uri>";
    const url = new URL(base);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", selectedClient.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", scopeValue);
    url.searchParams.set("state", state ?? "<state>");
    if (usePKCE) {
      url.searchParams.set("code_challenge", codeChallenge ?? "<code_challenge>");
      url.searchParams.set("code_challenge_method", pkceMethod);
    }
    if (useNonce && scopes.includes("openid")) {
      url.searchParams.set("nonce", nonce ?? "<nonce>");
    }
    if (prompt) {
      url.searchParams.set("prompt", prompt);
    }
    if (loginHint) {
      url.searchParams.set("login_hint", loginHint);
    }
    if (acrValues) {
      url.searchParams.set("acr_values", acrValues);
    }
    if (uiLocales) {
      url.searchParams.set("ui_locales", uiLocales);
    }
    if (maxAge) {
      url.searchParams.set("max_age", maxAge);
    }
    if (customParams) {
      for (const entry of customParams) {
        if (entry.key && entry.value) {
          url.searchParams.set(entry.key, entry.value);
        }
      }
    }
    if (resources.length > 0) {
      for (const item of resources) {
        url.searchParams.append("resource", item);
      }
    }

    const params = Array.from(url.searchParams.entries()).map(([key, value], index) => {
      const prefix = index === 0 ? "?" : "&";
      return `${prefix}${key}=${value}`;
    });
    return [url.origin + url.pathname, ...params].join("\n");
  }, [
    selectedIssuer,
    selectedClient,
    scopes,
    state,
    usePKCE,
    codeChallenge,
    pkceMethod,
    useNonce,
    nonce,
    prompt,
    loginHint,
    acrValues,
    uiLocales,
    maxAge,
    customParams,
    resources,
  ]);

  const tokenCurlSample = useMemo(() => {
    if (!selectedIssuer || !selectedClient) {
      return "curl -X POST <token_endpoint> \\\n  -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"grant_type=authorization_code&client_id=<client_id>&client_secret=<client_secret>&code=<code>&redirect_uri=<redirect_uri>\"";
    }

    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("client_id", selectedClient.clientId);
    if (selectedClient.clientSecret) {
      params.set("client_secret", selectedClient.clientSecret);
    }
    params.set("code", authorizationCode ?? "<code>");
    params.set("redirect_uri", getRedirectUri() || "<redirect_uri>");
    if (usePKCE) {
      params.set("code_verifier", codeVerifier ?? "<code_verifier>");
    }
    if (resources.length > 0) {
      for (const item of resources) {
        params.append("resource", item);
      }
    }

    return `curl -X POST \"${selectedIssuer.wellKnown.token_endpoint}\" \\\n  -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"${params.toString()}\"`;
  }, [selectedIssuer, selectedClient, authorizationCode, codeVerifier, usePKCE, resources]);

  const isReadyForAuth = Boolean(authorizationUrl);
  const isReadyForToken = Boolean(authorizationCode);
  const expectedIssuer = selectedIssuer?.wellKnown?.issuer ?? selectedIssuer?.issuer ?? null;

  const issuerOptions = issuers.map((issuer) => ({ value: issuer.id, label: issuer.name }));
  const clientOptions = issuerClients.map((client) => ({
    value: client.id,
    label: `${client.name} (${client.clientId})`,
  }));

  const main = (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={2}>Authorization Code Flow</Title>
        <Text c="dimmed">
          Prepare an authorization request, complete the login in a popup, then exchange the code
          for tokens.
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
          Reset Flow
        </Button>
      </Group>

      <Timeline
        active={
          tokenResponse
            ? 6
            : authorizationCode
              ? 4
              : isReadyForAuth
                ? 3
                : selectedIssuer && selectedClient
                  ? 2
                  : 1
        }
        bulletSize={28}
        lineWidth={2}
      >
        <Timeline.Item
          title="Redirect URI"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              1
            </Badge>
          }
        >
          <StepRedirectUri redirectUri={redirectUri} />
        </Timeline.Item>

        <Timeline.Item
          title="Settings"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              2
            </Badge>
          }
        >
          <StepSettings
            issuerOptions={issuerOptions}
            clientOptions={clientOptions}
            issuerId={issuerId}
            clientId={clientId}
            setValue={setValue}
            state={state}
            onRegenerateState={handleRegenerateState}
            scopes={scopes}
            scopeOptions={scopeOptions}
            onCreateScope={handleCreateScope}
            usePKCE={usePKCE}
            pkceMethod={pkceMethod}
            onTogglePkce={(value) => setValue("usePKCE", value)}
            onSetPkceMethod={(value) => setValue("pkceMethod", value)}
            supportedCodeChallengeMethods={supportedCodeChallengeMethods}
            codeVerifier={codeVerifier}
            codeChallenge={codeChallenge}
            onRegeneratePkce={handleRegeneratePkce}
            useNonce={useNonce}
            onToggleNonce={(value) => setValue("useNonce", value)}
            nonce={nonce}
            onRegenerateNonce={handleRegenerateNonce}
            prompt={prompt}
            onSetPrompt={(value) => setValue("prompt", value)}
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
          title="Start Authorize Request"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              3
            </Badge>
          }
        >
          <StepAuthorizeRequest
            disabled={!selectedIssuer || !selectedClient}
            onPrepare={handlePrepareFlow}
            onStart={handleStartFlow}
            authorizationUrl={authorizationUrl}
            formattedAuthorizationUrl={formattedAuthorizationUrl}
          />
        </Timeline.Item>

        <Timeline.Item
          title="Authorize Response"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              4
            </Badge>
          }
        >
          <StepAuthorizeResponse
            expectedState={state}
            callbackState={callbackState}
            expectedIssuer={expectedIssuer}
            callbackIssuer={callbackIssuer}
            authorizationCode={authorizationCode}
          />
        </Timeline.Item>

        <Timeline.Item
          title="Token Request"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              5
            </Badge>
          }
        >
          <StepTokenRequest
            disabled={!isReadyForToken}
            onExchange={handleExchangeToken}
            isLoading={isLoading}
            tokenCurlSample={tokenCurlSample}
          />
        </Timeline.Item>

        <Timeline.Item
          title="Token Response"
          bullet={
            <Badge color="dark" variant="filled" size="sm">
              6
            </Badge>
          }
        >
          <StepTokenResponse hasResponse={Boolean(tokenResponse)} />
        </Timeline.Item>
      </Timeline>

      <Card withBorder radius="md" p="md" className="flow-card">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600}>Server Response</Text>
            {tokenMeta && (
              <Badge color="dark" variant="light">
                HTTP {tokenMeta.status}
              </Badge>
            )}
          </Group>
          {tokenResponse ? (
            <>
              <Text size="xs" c="dimmed">
                Response Body
              </Text>
              <Code block className="curl-block">
                {JSON.stringify(tokenResponse, null, 2)}
              </Code>
              {tokenMeta && (
                <>
                  <Text size="xs" c="dimmed">
                    Response Headers
                  </Text>
                  <Code block className="curl-block">
                    {JSON.stringify(tokenMeta.headers, null, 2)}
                  </Code>
                </>
              )}
            </>
          ) : (
            <Text size="sm" c="dimmed">
              No server response yet.
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );

  const response = (
    <Stack gap="lg">
      <Title order={3}>Responses</Title>

      <Card withBorder radius="md" p="md" className="flow-card">
        <Stack gap={6}>
          <Text fw={600}>Current State</Text>
          <Group gap="xs" wrap="wrap">
            <Badge variant={authorizationUrl ? "filled" : "light"} color="dark">
              URL Ready
            </Badge>
            <Badge variant={authorizationCode ? "filled" : "light"} color="dark">
              Code Received
            </Badge>
            <Badge variant={tokenResponse ? "filled" : "light"} color="dark">
              Token Response
            </Badge>
          </Group>
          {state && (
            <Text size="xs" c="dimmed">
              state: {state}
            </Text>
          )}
          {nonce && (
            <Text size="xs" c="dimmed">
              nonce: {nonce}
            </Text>
          )}
        </Stack>
      </Card>

      {authorizationCode && (
        <Card withBorder radius="md" p="md" className="flow-card">
          <Text fw={600} mb="xs">
            Authorization Code
          </Text>
          <Text size="xs" style={{ wordBreak: "break-all" }}>
            {authorizationCode}
          </Text>
        </Card>
      )}

      {tokenResponse && (
        <TokenDisplay
          tokenResponse={tokenResponse}
          expectedIssuer={expectedIssuer ?? undefined}
          expectedAudience={selectedClient?.clientId ?? undefined}
          expectedNonce={useNonce ? nonce ?? undefined : undefined}
        />
      )}
    </Stack>
  );

  return <AppShell currentPath={currentPath} main={main} response={response} />;
}
