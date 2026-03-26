import { Paper, TextInput, Textarea, Button, Stack, Text, Alert, Code } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { buildEndSessionUrl, generateState, openAuthorizationPopup } from "../../../lib/oauth";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { OIDCProviderMetadata } from "../../../lib/oidc";

interface EndSessionFormData {
  id_token_hint?: string;
  post_logout_redirect_uri?: string;
  state?: string;
  ui_locales?: string;
}

interface EndSessionStepProps {
  client: ClientConfig | null;
  metadata: OIDCProviderMetadata | null;
  onLogoutInitiated: () => void;
}

export function EndSessionStep({ client, metadata, onLogoutInitiated }: EndSessionStepProps) {
  const [logoutUrl, setLogoutUrl] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<EndSessionFormData>({
    defaultValues: {
      post_logout_redirect_uri:
        typeof window !== "undefined" ? `${window.location.origin}/callback` : "",
    },
  });

  const idTokenHint = watch("id_token_hint");

  if (!client || !metadata) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Complete the previous step to configure the logout request.
        </Text>
      </Paper>
    );
  }

  if (!metadata.end_session_endpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Alert icon={<IconAlertCircle size={16} />} color="orange">
          This provider does not expose an <Code>end_session_endpoint</Code> in its discovery
          metadata. RP-Initiated Logout is not supported.
        </Alert>
      </Paper>
    );
  }

  const onSubmit = (data: EndSessionFormData) => {
    const url = buildEndSessionUrl(metadata.end_session_endpoint!, {
      id_token_hint: data.id_token_hint || undefined,
      post_logout_redirect_uri: data.post_logout_redirect_uri || undefined,
      state: data.state || undefined,
      client_id: client.clientId,
      ui_locales: data.ui_locales || undefined,
    });
    setLogoutUrl(url);
    const popup = openAuthorizationPopup(url);
    if (popup) {
      onLogoutInitiated();
    }
  };

  return (
    <Paper p="md" mt="sm" withBorder>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Textarea
            label="ID Token Hint"
            {...register("id_token_hint")}
            placeholder="Paste a previously issued ID token (recommended)"
            description="Helps the provider identify the session to terminate"
            minRows={3}
          />

          <TextInput
            label="Post-Logout Redirect URI"
            {...register("post_logout_redirect_uri")}
            placeholder="https://example.com/logged-out"
          />

          <TextInput
            label="State"
            {...register("state")}
            placeholder="Optional CSRF protection state"
            rightSection={
              <Button
                variant="subtle"
                size="compact-xs"
                onClick={() => setValue("state", generateState())}
              >
                Generate
              </Button>
            }
            rightSectionWidth={80}
          />

          <TextInput label="UI Locales" {...register("ui_locales")} placeholder="e.g. en ja" />

          {logoutUrl && (
            <Alert color="blue" variant="light">
              <Text size="xs" style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
                {logoutUrl}
              </Text>
            </Alert>
          )}

          {!idTokenHint && (
            <Alert color="yellow" variant="light">
              Providing an <Code>id_token_hint</Code> is recommended so the provider can identify
              which session to terminate.
            </Alert>
          )}

          <Button type="submit">Initiate Logout</Button>
        </Stack>
      </form>
    </Paper>
  );
}
