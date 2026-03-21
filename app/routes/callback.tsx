import { createRoute } from "honox/factory";
import { Alert, Card, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";

export default createRoute((c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const iss = c.req.query("iss");
  const error = c.req.query("error");
  const errorDescription = c.req.query("error_description");

  return c.render(
    <Card withBorder radius="md" p="lg" style={{ maxWidth: 520, margin: "64px auto" }}>
      <Stack gap="md">
        <Title order={3}>OAuth Callback</Title>
        {error ? (
          <Alert icon={<IconAlertCircle size={18} />} color="red" title={`Error: ${error}`}>
            {errorDescription || "Authorization failed."}
          </Alert>
        ) : code ? (
          <Alert icon={<IconCircleCheck size={18} />} color="green" title="Authorization code received">
            <Stack gap={6}>
              <Text size="sm" c="dimmed">
                Code: {code.substring(0, 20)}...
              </Text>
              {state && (
                <Text size="sm" c="dimmed">
                  State: {state}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                This window will close automatically.
              </Text>
            </Stack>
          </Alert>
        ) : (
          <Text c="dimmed">No authorization code received.</Text>
        )}
      </Stack>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth-callback',
                code: ${JSON.stringify(code || null)},
                state: ${JSON.stringify(state || null)},
                iss: ${JSON.stringify(iss || null)},
                error: ${JSON.stringify(error || null)},
                errorDescription: ${JSON.stringify(errorDescription || null)}
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            }
          `,
        }}
      />
    </Card>,
  );
});
