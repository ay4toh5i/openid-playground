/**
 * Callback received step - props-based, derives stateValid during render
 * No useEffect or auto-advance
 */
import { Paper, Stack, Text, Code, Group, Badge, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { CopyButton } from "../../common/CopyButton";
import type { AuthorizationCallbackData } from "../../../lib/flow-types";

interface CallbackReceivedStepProps {
  callback: AuthorizationCallbackData | null;
  expectedState?: string;
}

export function CallbackReceivedStep({ callback, expectedState }: CallbackReceivedStepProps) {
  if (!callback) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">Waiting for authorization callback...</Text>
      </Paper>
    );
  }

  const stateValid =
    expectedState && callback.state ? expectedState === callback.state : null;

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
            <CopyButton value={callback.code ?? ""} label="Copy code" />
          </Group>
          <Code block>{callback.code}</Code>
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
            <CopyButton value={callback.state ?? ""} label="Copy state" />
          </Group>
          <Code block>{callback.state}</Code>
        </div>
      </Stack>
    </Paper>
  );
}
