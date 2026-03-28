import { Paper, Textarea, TextInput, Button, Stack, Text, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { refreshAccessToken } from "../../../lib/oauth";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponse } from "../../../lib/oidc";

interface RefreshTokenFormData {
  refreshToken: string;
  scope?: string;
}

interface RefreshTokenStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  onTokenReceived: (token: TokenResponse) => void;
}

export function RefreshTokenStep({
  client,
  tokenEndpoint,
  onTokenReceived,
}: RefreshTokenStepProps) {
  const { register, handleSubmit } = useForm<RefreshTokenFormData>({
    defaultValues: { refreshToken: "", scope: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: RefreshTokenFormData) => {
      const result = await refreshAccessToken(
        tokenEndpoint!,
        client!,
        data.refreshToken,
        data.scope || undefined,
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
          Complete the previous steps to use refresh token.
        </Text>
      </Paper>
    );
  }

  const onSubmit = (data: RefreshTokenFormData) => {
    if (!data.refreshToken.trim()) {
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Paper p="md" mt="sm" withBorder>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Textarea
            label="Refresh Token"
            {...register("refreshToken")}
            required
            minRows={2}
            placeholder="Enter your refresh token"
          />
          <TextInput
            label="Scope (optional)"
            {...register("scope")}
            placeholder="Optional: different scopes"
          />
          <Button type="submit" loading={mutation.isPending}>
            Refresh Token
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
