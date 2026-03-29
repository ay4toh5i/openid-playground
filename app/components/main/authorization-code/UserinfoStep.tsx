import { Paper, Stack, Text, Alert, Group, Loader } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { callUserinfo, buildUserinfoCurlCommand } from "../../../lib/oauth";
import { CopyButton } from "../../common/CopyButton";
import { CodeBlock } from "../../common/CodeBlock";
import type { ClientConfig } from "../../../lib/storage/client-config";
import type { TokenResponse } from "../../../lib/oidc";

interface UserinfoStepProps {
  client: ClientConfig | null;
  userinfoEndpoint: string | null | undefined;
  tokenResponse: TokenResponse | null;
  onUserinfoReceived: (claims: Record<string, unknown>) => void;
}

export function UserinfoStep({
  client,
  userinfoEndpoint,
  tokenResponse,
  onUserinfoReceived,
}: UserinfoStepProps) {
  const executedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const claims = await callUserinfo(userinfoEndpoint!, tokenResponse!.access_token, client!);
      if ("error" in claims) {
        const err = String(claims["error"]);
        const desc = claims["error_description"]
          ? ": " + JSON.stringify(claims["error_description"])
          : "";
        throw new Error(err + desc);
      }
      return claims;
    },
    onSuccess: (claims) => {
      onUserinfoReceived(claims);
    },
  });

  // Auto-execute when token response becomes available
  useEffect(() => {
    if (tokenResponse && client && userinfoEndpoint && !executedRef.current) {
      executedRef.current = true;
      mutation.mutate();
    }
  }, [tokenResponse]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset guard when token changes
  useEffect(() => {
    executedRef.current = false;
  }, [tokenResponse?.access_token]);

  if (!userinfoEndpoint) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          This provider does not expose a userinfo_endpoint.
        </Text>
      </Paper>
    );
  }

  if (!tokenResponse) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Waiting for token response...
        </Text>
      </Paper>
    );
  }

  const curlCommand = buildUserinfoCurlCommand(
    userinfoEndpoint,
    tokenResponse.access_token,
    !!client?.dpop,
  );

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Request:
            </Text>
            <CopyButton value={curlCommand} label="Copy" />
          </Group>
          <CodeBlock code={curlCommand} lang="bash" />
        </div>

        {mutation.isPending && (
          <Group gap="xs">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Calling UserInfo endpoint...
            </Text>
          </Group>
        )}

        {mutation.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {mutation.error instanceof Error ? mutation.error.message : "Request failed"}
          </Alert>
        )}

        {mutation.data && (
          <div>
            <Text size="sm" fw={500} mb="xs">
              Response:
            </Text>
            <CodeBlock code={JSON.stringify(mutation.data, null, 2)} lang="json" />
          </div>
        )}
      </Stack>
    </Paper>
  );
}
