/**
 * Token response step
 */
import { Paper, Stack, Code, Button, Text, Group } from "@mantine/core";
import { usePlayground } from "../../../hooks/usePlaygroundState";
import { CopyButton } from "../../common/CopyButton";

export function TokenResponseStep() {
  const { state, dispatch } = usePlayground();

  if (!state.tokenResponse) {
    return null;
  }

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Token Response:
            </Text>
            <CopyButton
              value={JSON.stringify(state.tokenResponse, null, 2)}
              label="Copy response"
            />
          </Group>
          <Code block style={{ fontSize: "11px", overflowY: "auto", maxHeight: "400px" }}>
            {JSON.stringify(state.tokenResponse, null, 2)}
          </Code>
        </div>
        <Button variant="light" onClick={() => dispatch({ type: "RESET_FLOW" })}>
          Reset Flow
        </Button>
      </Stack>
    </Paper>
  );
}
