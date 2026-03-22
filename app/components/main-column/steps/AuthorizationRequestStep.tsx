/**
 * Authorization request configuration step
 * Changes are reflected in real-time (no submit button)
 */
import {
  Paper,
  TextInput,
  Stack,
  Select,
  NumberInput,
  Textarea,
  Divider,
  Text,
  Accordion,
  Switch,
  ActionIcon,
  Group,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { IconRefresh, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { generateState, generateNonce } from "../../../hooks/useAuthorizationFlow";
import { generatePKCEPair } from "../../../lib/crypto/pkce";
import type { AuthorizationRequestData, PKCEState } from "../../../lib/flow-types";

interface AuthorizationRequestStepProps {
  onRequestConfigured: (request: AuthorizationRequestData, pkce: PKCEState | null) => void;
}

export function AuthorizationRequestStep({ onRequestConfigured }: AuthorizationRequestStepProps) {
  const [usePKCE, setUsePKCE] = useState(true);
  const [useNonce, setUseNonce] = useState(true);
  const [pkcePreview, setPkcePreview] = useState<{ verifier: string; challenge: string } | null>(null);
  const [customParams, setCustomParams] = useState<Array<{ key: string; value: string }>>([]);

  const { register, control, watch, setValue, getValues } = useForm<AuthorizationRequestData>({
    defaultValues: {
      scope: "openid profile email",
      response_type: "code",
      state: generateState(),
      nonce: generateNonce(),
    },
  });

  // Generate initial PKCE - legitimate useEffect (async crypto)
  useEffect(() => {
    generatePKCEPair("S256").then(setPkcePreview);
  }, []);

  // Ref holds latest non-form state so buildAndEmit stays stable
  const stateRef = useRef({ usePKCE, useNonce, pkcePreview, customParams, onRequestConfigured });
  stateRef.current = { usePKCE, useNonce, pkcePreview, customParams, onRequestConfigured };

  const buildAndEmit = useCallback(() => {
    const { usePKCE, useNonce, pkcePreview, customParams, onRequestConfigured } = stateRef.current;
    const values = getValues();
    const request: AuthorizationRequestData = { ...values };

    if (!useNonce) request.nonce = undefined;

    if (customParams.length > 0) {
      const obj: Record<string, string> = {};
      customParams.forEach(({ key, value }) => {
        if (key && value) obj[key] = value;
      });
      if (Object.keys(obj).length > 0) request.customParams = obj;
    }

    let pkceState: PKCEState | null = null;
    if (usePKCE && pkcePreview) {
      pkceState = { verifier: pkcePreview.verifier, challenge: pkcePreview.challenge, method: "S256" };
      request.code_challenge = pkceState.challenge;
      request.code_challenge_method = "S256";
    } else {
      delete request.code_challenge;
      delete request.code_challenge_method;
    }

    onRequestConfigured(request, pkceState);
  }, [getValues]); // getValues is stable

  // Subscribe to form field changes - legitimate useEffect (external subscription)
  useEffect(() => {
    buildAndEmit(); // emit initial values
    const { unsubscribe } = watch(() => buildAndEmit());
    return unsubscribe;
  }, [watch, buildAndEmit]); // both stable

  // Re-emit when non-form state changes
  useEffect(() => {
    buildAndEmit();
  }, [usePKCE, useNonce, pkcePreview, customParams, buildAndEmit]);

  const regeneratePKCE = () => {
    generatePKCEPair("S256").then(setPkcePreview);
  };

  const addCustomParam = () => setCustomParams([...customParams, { key: "", value: "" }]);
  const removeCustomParam = (index: number) =>
    setCustomParams(customParams.filter((_, i) => i !== index));
  const updateCustomParam = (index: number, field: "key" | "value", value: string) => {
    const updated = [...customParams];
    updated[index][field] = value;
    setCustomParams(updated);
  };

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
            <Switch
              label="Enable Nonce"
              description="Recommended for OIDC to mitigate replay attacks"
              checked={useNonce}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                setUseNonce(enabled);
                if (enabled) setValue("nonce", generateNonce());
                else setValue("nonce", undefined);
              }}
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
            <Switch
              label="Enable PKCE (Proof Key for Code Exchange)"
              description="Recommended for all clients to prevent authorization code interception attacks"
              checked={usePKCE}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                setUsePKCE(enabled);
                if (enabled && !pkcePreview) regeneratePKCE();
              }}
            />
            {usePKCE && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={regeneratePKCE}
                title="Regenerate PKCE values"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            )}
          </Group>
          {usePKCE && pkcePreview && (
            <Stack gap="md">
              <TextInput
                label="Code Verifier"
                value={pkcePreview.verifier}
                readOnly
                styles={{ input: { fontFamily: "monospace", fontSize: "12px" } }}
              />
              <TextInput
                label="Code Challenge (SHA-256)"
                value={pkcePreview.challenge}
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

                <Textarea
                  label="ID Token Hint"
                  description="Previously issued ID Token"
                  {...register("id_token_hint")}
                  minRows={2}
                  placeholder="Optional"
                />

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

                {customParams.map((param, index) => (
                  <Group key={index} gap="xs">
                    <TextInput
                      placeholder="Parameter name"
                      value={param.key}
                      onChange={(e) => updateCustomParam(index, "key", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      placeholder="Parameter value"
                      value={param.value}
                      onChange={(e) => updateCustomParam(index, "value", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeCustomParam(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}

                <ActionIcon
                  variant="light"
                  onClick={addCustomParam}
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
