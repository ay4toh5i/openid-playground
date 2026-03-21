import { createRoute } from "honox/factory";
import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { AppShell } from "../components/AppShell";
import SettingsRegistry from "../islands/SettingsRegistry";

export default createRoute((c) => {
  const Settings = () => {
    return (
      <AppShell
        currentPath="/settings"
        main={
          <Stack gap="lg">
            <Group justify="space-between">
              <div>
                <Title order={2}>Settings</Title>
                <Text size="sm" c="dimmed">
                  Register issuers and clients once, then select them in each flow.
                </Text>
              </div>
            </Group>

            <Card withBorder radius="md" p="lg">
              <SettingsRegistry />
            </Card>
          </Stack>
        }
      />
    );
  };

  return c.render(<Settings />);
});
