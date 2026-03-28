import { Paper, Stack, Text, Code, Group, Badge, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { CopyButton } from "../../common/CopyButton";
import type { AuthorizationResponse } from "../../../lib/oidc";

interface CallbackReceivedStepProps {
  callback: AuthorizationResponse | null;
  expectedState?: string;
}

export function CallbackReceivedStep({ callback, expectedState }: CallbackReceivedStepProps) {
  if (!callback) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Waiting for authorization callback...
        </Text>
      </Paper>
    );
  }

  const cb = callback;
  const stateValid = expectedState && cb.state ? expectedState === cb.state : null;

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        {stateValid === false && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            State mismatch detected - possible CSRF attack!
          </Alert>
        )}

        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Authorization Code:
            </Text>
            <CopyButton value={cb.code ?? ""} label="Copy code" />
          </Group>
          <Code block>{cb.code}</Code>
        </div>

        <div>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                State:
              </Text>
              {stateValid && (
                <Badge color="green" size="xs">
                  ✓ Valid
                </Badge>
              )}
            </Group>
            <CopyButton value={cb.state ?? ""} label="Copy state" />
          </Group>
          <Code block>{cb.state}</Code>
        </div>
      </Stack>
    </Paper>
  );
}
