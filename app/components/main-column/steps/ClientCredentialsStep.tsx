/**
 * Client Credentials flow step
 */
import { Paper, TextInput, Button, Stack, Textarea } from "@mantine/core";
import { useForm } from "react-hook-form";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { useAuthorizationFlow } from "../../../hooks/useAuthorizationFlow";
import { useState } from "react";

interface ClientCredentialsFormData {
  scope?: string;
  resource?: string;
}

export function ClientCredentialsStep() {
  const { state, dispatch } = usePlayground();
  const { requestClientCredentialsToken } = useAuthorizationFlow();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<ClientCredentialsFormData>({
    defaultValues: {
      scope: "",
      resource: "",
    },
  });

  const onSubmit = async (data: ClientCredentialsFormData) => {
    if (!state.selectedClient || !state.providerMetadata?.token_endpoint) {
      return;
    }

    setLoading(true);
    try {
      const result = await requestClientCredentialsToken(
        state.providerMetadata.token_endpoint,
        state.selectedClient,
        data.scope || undefined,
        data.resource || undefined
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
        payload: error instanceof Error ? error.message : "Failed to request token",
      });
    } finally {
      setLoading(false);
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
