import { Paper, Stack, Text, Code, Button, Group } from "@mantine/core";
import { CopyButton } from "../../common/CopyButton";
import { CodeBlock } from "../../common/CodeBlock";
import type { TokenResponse } from "../../../lib/oidc";

interface TokenResponseStepProps {
  tokenResponse: TokenResponse | null;
  onReset?: () => void;
}

export function TokenResponseStep({ tokenResponse, onReset }: TokenResponseStepProps) {
  if (!tokenResponse) {
    return (
      <Paper p="md" mt="sm" withBorder>
        <Text size="sm" c="dimmed">
          Waiting for token response...
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" mt="sm" withBorder>
      <Stack gap="md">
        <Text size="sm" c="green" fw={500}>
          Tokens received successfully!
        </Text>

        {tokenResponse.id_token && (
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={500}>
                ID Token:
              </Text>
              <CopyButton value={tokenResponse.id_token} label="Copy" />
            </Group>
            <Code
              block
              style={{
                fontSize: "11px",
                wordBreak: "break-all",
                maxHeight: "100px",
                overflowY: "auto",
              }}
            >
              {tokenResponse.id_token}
            </Code>
          </div>
        )}

        <div>
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={500}>
              Access Token:
            </Text>
            <CopyButton value={tokenResponse.access_token} label="Copy" />
          </Group>
          <Code
            block
            style={{
              fontSize: "11px",
              wordBreak: "break-all",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            {tokenResponse.access_token}
          </Code>
        </div>

        {tokenResponse.refresh_token && (
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={500}>
                Refresh Token:
              </Text>
              <CopyButton value={tokenResponse.refresh_token} label="Copy" />
            </Group>
            <Code
              block
              style={{
                fontSize: "11px",
                wordBreak: "break-all",
                maxHeight: "100px",
                overflowY: "auto",
              }}
            >
              {tokenResponse.refresh_token}
            </Code>
          </div>
        )}

        <div>
          <Text size="xs" fw={500} mb="xs">
            Full Token Response:
          </Text>
          <CodeBlock code={JSON.stringify(tokenResponse, null, 2)} lang="json" />
        </div>

        {onReset && (
          <Button variant="light" onClick={onReset}>
            Start Over
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
