/**
 * Client Credentials flow step - props-based, no context
 */
import { Paper, TextInput, Button, Stack, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { requestClientCredentialsToken } from "../../../hooks/useAuthorizationFlow";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponseData, TokenErrorData } from "../../../lib/flow-types";

interface ClientCredentialsFormData {
  scope?: string;
  resource?: string;
}

interface ClientCredentialsStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  onTokenReceived: (token: TokenResponseData) => void;
  onTokenError: (error: TokenErrorData) => void;
}

export function ClientCredentialsStep({
  client,
  tokenEndpoint,
  onTokenReceived,
  onTokenError,
}: ClientCredentialsStepProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<ClientCredentialsFormData>({
    defaultValues: { scope: "", resource: "" },
  });

  if (!client || !tokenEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">Complete the previous step to request a token.</Text>
      </Paper>
    );
  }

  const onSubmit = async (data: ClientCredentialsFormData) => {
    setLoading(true);
    const result = await requestClientCredentialsToken(
      tokenEndpoint,
      client,
      data.scope || undefined,
      data.resource || undefined
    );
    setLoading(false);
    if ("error" in result) {
      onTokenError(result);
    } else {
      onTokenReceived(result);
    }
  };

  return (
    <Paper p="md" mt="sm" withBorder>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Scope"
            {...register("scope")}
            placeholder="Optional: api:read api:write"
          />
          <TextInput
            label="Resource"
            {...register("resource")}
            placeholder="Optional: https://api.example.com"
          />
          <Button type="submit" loading={loading}>
            Request Token
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
