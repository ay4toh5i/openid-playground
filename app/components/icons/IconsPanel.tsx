import { Stack, ActionIcon, Tooltip, Modal, useMantineColorScheme } from "@mantine/core";
import {
  IconSettings,
  IconFileImport,
  IconFileExport,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useState } from "react";
import { ClientConfigStorage } from "../../lib/storage/client-config";
import ClientConfigManager from "../../islands/client-config-manager";

export function IconsPanel() {
  const [settingsOpened, setSettingsOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleExport = () => {
    const json = ClientConfigStorage.export();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oidc-clients-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const count = ClientConfigStorage.import(text, "merge");
        alert(`Successfully imported ${count} client configuration(s)`);
        // Refresh the page to show imported clients
        window.location.reload();
      } catch (error) {
        alert(`Failed to import: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };
    input.click();
  };

  return (
    <>
      <Stack gap="xs" align="center">
        <Tooltip label={colorScheme === "dark" ? "Light Mode" : "Dark Mode"} position="right">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={toggleColorScheme}
            aria-label="Toggle color scheme"
          >
            {colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Settings" position="right">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setSettingsOpened(true)}
            aria-label="Settings"
          >
            <IconSettings size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Import Clients" position="right">
          <ActionIcon variant="subtle" size="lg" onClick={handleImport} aria-label="Import clients">
            <IconFileImport size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Export Clients" position="right">
          <ActionIcon variant="subtle" size="lg" onClick={handleExport} aria-label="Export clients">
            <IconFileExport size={20} />
          </ActionIcon>
        </Tooltip>
      </Stack>

      <Modal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        title="OAuth Client Settings"
        size="xl"
        styles={{
          body: { padding: 0 },
          header: { padding: "16px 24px" },
        }}
      >
        <ClientConfigManager onClose={() => setSettingsOpened(false)} />
      </Modal>
    </>
  );
}
