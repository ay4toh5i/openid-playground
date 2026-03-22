/**
 * Refresh Token flow step - props-based, no context
 */
import { Paper, Textarea, TextInput, Button, Stack, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { refreshAccessToken } from "../../../hooks/useAuthorizationFlow";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponseData, TokenErrorData } from "../../../lib/flow-types";

interface RefreshTokenFormData {
  refreshToken: string;
  scope?: string;
}

interface RefreshTokenStepProps {
  client: ClientConfig | null;
  tokenEndpoint: string | null | undefined;
  onTokenReceived: (token: TokenResponseData) => void;
  onTokenError: (error: TokenErrorData) => void;
}

export function RefreshTokenStep({
  client,
  tokenEndpoint,
  onTokenReceived,
  onTokenError,
}: RefreshTokenStepProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<RefreshTokenFormData>({
    defaultValues: { refreshToken: "", scope: "" },
  });

  if (!client || !tokenEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">Complete the previous steps to use refresh token.</Text>
      </Paper>
    );
  }

  const onSubmit = async (data: RefreshTokenFormData) => {
    if (!data.refreshToken.trim()) return;
    setLoading(true);
    const result = await refreshAccessToken(
      tokenEndpoint,
      client,
      data.refreshToken,
      data.scope || undefined
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
          <Button type="submit" loading={loading}>
            Refresh Token
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
