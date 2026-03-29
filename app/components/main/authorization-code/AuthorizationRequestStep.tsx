import {
  Paper,
  TextInput,
  Stack,
  Select,
  NumberInput,
  Input,
  Divider,
  Text,
  Accordion,
  Switch,
  ActionIcon,
  Group,
} from "@mantine/core";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { IconRefresh, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { generateState, generateNonce } from "../../../lib/oauth";
import { generateCodeVerifier, generateCodeChallenge } from "../../../lib/crypto/pkce";
import type { AuthorizationRequestConfig } from "../../../lib/oidc";

function usePkceChallenge(verifier: string): string {
  const [challenge, setChallenge] = useState("");
  useEffect(() => {
    void (async () => {
      if (verifier !== "") {
        setChallenge("");
      }

      setChallenge(await generateCodeChallenge(verifier));
    })();
  }, [verifier]);
  return challenge;
}

interface AuthorizationRequestStepProps {
  onRequestConfigured: (request: AuthorizationRequestConfig) => void;
}

type FormValues = {
  scope: string;
  response_type: string;
  state: string;
  nonce: string;
  useNonce: boolean;
  usePKCE: boolean;
  pkceVerifier: string;
  response_mode?: string;
  display?: string;
  prompt?: string;
  max_age?: number;
  ui_locales?: string;
  id_token_hint?: string;
  login_hint?: string;
  acr_values?: string;
  resource?: string;
  customParams: Array<{ key: string; value: string }>;
};

function buildRequest(values: FormValues): AuthorizationRequestConfig {
  const request: AuthorizationRequestConfig = {
    scope: values.scope,
    response_type: values.response_type,
    state: values.state,
    nonce: values.useNonce ? values.nonce : undefined,
    response_mode: values.response_mode,
    display: values.display as AuthorizationRequestConfig["display"],
    prompt: values.prompt,
    max_age: values.max_age,
    ui_locales: values.ui_locales,
    id_token_hint: values.id_token_hint,
    login_hint: values.login_hint,
    acr_values: values.acr_values,
    resource: values.resource,
  };

  const validCustomParams = values.customParams.filter((p) => p.key && p.value);
  if (validCustomParams.length > 0) {
    request.customParams = Object.fromEntries(validCustomParams.map((p) => [p.key, p.value]));
  }

  if (values.usePKCE && values.pkceVerifier) {
    request.code_verifier = values.pkceVerifier;
  }

  return request;
}

export function AuthorizationRequestStep({
  onRequestConfigured: onAuthRequestChanged,
}: AuthorizationRequestStepProps) {
  const { register, control, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      scope: "openid profile email",
      response_type: "code",
      state: generateState(),
      nonce: generateNonce(),
      useNonce: true,
      usePKCE: true,
      pkceVerifier: generateCodeVerifier(),
      customParams: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "customParams" });

  const onAuthRequestChangedRef = useRef(onAuthRequestChanged);
  useEffect(() => {
    onAuthRequestChangedRef.current = onAuthRequestChanged;
  });

  const emit = useCallback(() => {
    onAuthRequestChangedRef.current(buildRequest(getValues()));
  }, [getValues]);

  useEffect(() => {
    emit();
    const { unsubscribe } = watch(() => emit());
    return unsubscribe;
  }, [emit, watch]);

  const { usePKCE, useNonce, pkceVerifier } = watch();
  const pkceChallenge = usePkceChallenge(pkceVerifier);

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={600}>
          Required Parameters
        </Text>

        <TextInput
          label="Scope"
          description="Space-separated list of scopes (must include 'openid' for OIDC)"
          {...register("scope")}
          required
          placeholder="openid profile email"
        />

        <TextInput
          label="Response Type"
          description="Determines the authorization processing flow"
          {...register("response_type")}
          required
          placeholder="code"
        />

        <Controller
          name="state"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  State (CSRF Protection)
                </Text>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => setValue("state", generateState())}
                  title="Regenerate state"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>
              <TextInput {...field} description="Opaque value for CSRF protection" required />
            </div>
          )}
        />

        <div>
          <Group justify="space-between" mb="xs">
            <Controller
              name="useNonce"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Enable Nonce"
                  description="Recommended for OIDC to mitigate replay attacks"
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.currentTarget.checked);
                    if (e.currentTarget.checked) {
                      setValue("nonce", generateNonce());
                    }
                  }}
                />
              )}
            />
            {useNonce && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setValue("nonce", generateNonce())}
                title="Regenerate nonce"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            )}
          </Group>
          {useNonce && (
            <Controller
              name="nonce"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  description="String value to associate client session with ID Token"
                />
              )}
            />
          )}
        </div>

        <div>
          <Group justify="space-between" mb="xs">
            <Controller
              name="usePKCE"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Enable PKCE (Proof Key for Code Exchange)"
                  description="Recommended for all clients to prevent authorization code interception attacks"
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.currentTarget.checked);
                  }}
                />
              )}
            />
            {usePKCE && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setValue("pkceVerifier", generateCodeVerifier())}
                title="Regenerate PKCE values"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            )}
          </Group>
          {usePKCE && pkceVerifier && (
            <Stack gap="md">
              <TextInput
                label="Code Verifier"
                value={pkceVerifier}
                readOnly
                styles={{ input: { fontFamily: "monospace", fontSize: "12px" } }}
              />
              <TextInput
                label="Code Challenge (SHA-256)"
                value={pkceChallenge}
                readOnly
                styles={{ input: { fontFamily: "monospace", fontSize: "12px" } }}
              />
            </Stack>
          )}
        </div>

        <Accordion variant="contained">
          <Accordion.Item value="optional">
            <Accordion.Control>Optional Parameters</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Controller
                  name="response_mode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Response Mode"
                      description="How authorization response parameters are returned"
                      data={[
                        { value: "query", label: "Query (default for code)" },
                        { value: "fragment", label: "Fragment (default for implicit)" },
                        { value: "form_post", label: "Form Post" },
                      ]}
                      clearable
                      placeholder="Default based on response_type"
                    />
                  )}
                />

                <Controller
                  name="display"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Display"
                      description="How the authorization server displays authentication UI"
                      data={[
                        { value: "page", label: "Page (default)" },
                        { value: "popup", label: "Popup" },
                        { value: "touch", label: "Touch" },
                        { value: "wap", label: "WAP" },
                      ]}
                      clearable
                      placeholder="page"
                    />
                  )}
                />

                <TextInput
                  label="Prompt"
                  description="Space-separated list: none, login, consent, select_account"
                  {...register("prompt")}
                  placeholder="e.g., login consent"
                />

                <Controller
                  name="max_age"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label="Max Age"
                      description="Maximum authentication age in seconds"
                      {...field}
                      min={0}
                      placeholder="e.g., 3600"
                    />
                  )}
                />

                <TextInput
                  label="UI Locales"
                  description="Space-separated BCP47 language tags (e.g., 'en-US ja')"
                  {...register("ui_locales")}
                  placeholder="e.g., en-US fr"
                />

                <Input.Wrapper label="ID Token Hint" description="Previously issued ID Token">
                  <Input
                    component="textarea"
                    {...register("id_token_hint")}
                    placeholder="Optional"
                    rows={2}
                  />
                </Input.Wrapper>

                <TextInput
                  label="Login Hint"
                  description="Hint about the login identifier (e.g., email)"
                  {...register("login_hint")}
                  placeholder="user@example.com"
                />

                <TextInput
                  label="ACR Values"
                  description="Space-separated Authentication Context Class Reference values"
                  {...register("acr_values")}
                  placeholder="e.g., urn:mace:incommon:iap:silver"
                />

                <TextInput
                  label="Resource"
                  description="Target service or resource (RFC 8707)"
                  {...register("resource")}
                  placeholder="e.g., https://api.example.com"
                />

                <Divider label="Custom Parameters" />

                {fields.map((field, index) => (
                  <Group key={field.id} gap="xs">
                    <TextInput
                      placeholder="Parameter name"
                      {...register(`customParams.${index}.key`)}
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      placeholder="Parameter value"
                      {...register(`customParams.${index}.value`)}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon color="red" variant="subtle" onClick={() => remove(index)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}

                <ActionIcon
                  variant="light"
                  onClick={() => append({ key: "", value: "" })}
                  title="Add custom parameter"
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Paper>
  );
}
