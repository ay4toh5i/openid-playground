/**
 * Callback received step
 */
import { Paper, Stack, Text, Code, Button, Group, Badge, Alert } from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { CopyButton } from "../../common/CopyButton";
import { useEffect, useState } from "react";

export function CallbackReceivedStep() {
  const { state, dispatch } = usePlayground();
  const [stateValid, setStateValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (state.authCallback?.code) {
      // Verify state parameter
      if (state.authRequest?.state && state.authCallback.state) {
        const isValid = state.authRequest.state === state.authCallback.state;
        setStateValid(isValid);
      }

      // Auto-advance after a brief moment if state is valid
      const timer = setTimeout(() => {
        dispatch({ type: "ADVANCE_STEP" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.authCallback, dispatch]);

  if (!state.authCallback) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Waiting for authorization callback...
        </Text>
      </Paper>
    );
  }

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
            <CopyButton value={state.authCallback.code || ""} label="Copy code" />
          </Group>
          <Code block>{state.authCallback.code}</Code>
        </div>

        <div>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                State:
              </Text>
              {stateValid && <Badge color="green" size="xs">✓ Valid</Badge>}
            </Group>
            <CopyButton value={state.authCallback.state || ""} label="Copy state" />
          </Group>
          <Code block>{state.authCallback.state}</Code>
        </div>
      </Stack>
    </Paper>
  );
}
