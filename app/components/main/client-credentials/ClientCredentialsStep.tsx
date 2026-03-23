import { Paper, TextInput, Button, Stack, Text, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestClientCredentialsToken } from "../../../lib/oauth";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponse } from "../../../lib/oidc";

interface ClientCredentialsFormData {
  scope?: string;
  resource?: string;
}

interface ClientCredentialsStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  onTokenReceived: (token: TokenResponse) => void;
}

export function ClientCredentialsStep({
  client,
  tokenEndpoint,
  onTokenReceived,
}: ClientCredentialsStepProps) {
  const { register, handleSubmit } = useForm<ClientCredentialsFormData>({
    defaultValues: { scope: "", resource: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientCredentialsFormData) => {
      const result = await requestClientCredentialsToken(
        tokenEndpoint!,
        client!,
        data.scope || undefined,
        data.resource || undefined,
      );
      if ("error" in result) {
        throw new Error(
          `${result.error}${result.error_description ? ": " + result.error_description : ""}`,
        );
      }
      return result;
    },
    onSuccess: (token) => {
      onTokenReceived(token);
    },
  });

  if (!client || !tokenEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Complete the previous step to request a token.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" mt="sm" withBorder>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
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
          <Button type="submit" loading={mutation.isPending}>
            Request Token
          </Button>
          {mutation.isError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mt="sm">
              {mutation.error instanceof Error ? mutation.error.message : "Request failed"}
            </Alert>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
