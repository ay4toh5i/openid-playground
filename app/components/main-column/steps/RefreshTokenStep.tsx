/**
 * Refresh Token flow step
 */
import { Paper, Textarea, TextInput, Button, Stack, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { useAuthorizationFlow } from "../../../hooks/useAuthorizationFlow";
import { useState } from "react";

interface RefreshTokenFormData {
  refreshToken: string;
  scope?: string;
}

export function RefreshTokenStep() {
  const { state, dispatch } = usePlayground();
  const { refreshAccessToken } = useAuthorizationFlow();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm<RefreshTokenFormData>({
    defaultValues: {
      refreshToken: state.tokenResponse?.refresh_token || "",
      scope: "",
    },
  });

  const onSubmit = async (data: RefreshTokenFormData) => {
    if (!state.selectedClient || !state.providerMetadata?.token_endpoint) {
      return;
    }

    setLoading(true);
    try {
      const result = await refreshAccessToken(
        state.providerMetadata.token_endpoint,
        state.selectedClient,
        data.refreshToken,
        data.scope || undefined
      );

      if ("error" in result) {
        dispatch({ type: "SET_TOKEN_ERROR", payload: result });
      } else {
        dispatch({ type: "SET_TOKEN_RESPONSE", payload: result });
        dispatch({ type: "ADVANCE_STEP" });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to refresh token",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" mt="sm" withBorder>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {state.tokenResponse?.refresh_token && (
            <Text size="xs" c="dimmed">
              Using refresh token from previous flow
            </Text>
          )}
          <Textarea
            label="Refresh Token"
            {...register("refreshToken")}
            required
            minRows={3}
            placeholder="Enter refresh token"
          />
          <TextInput
            label="Scope (Optional)"
            {...register("scope")}
            placeholder="Must be subset of original scope"
          />
          <Button type="submit" loading={loading}>
            Refresh Access Token
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
