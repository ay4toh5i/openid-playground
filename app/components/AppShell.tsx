import type { FC, ReactNode } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconAdjustments,
  IconFileDownload,
  IconFileUpload,
  IconShieldLock,
} from "@tabler/icons-react";

interface AppShellProps {
  currentPath?: string;
  main: ReactNode;
  response?: ReactNode;
}

const navItems = [
  { label: "Authorization Code", href: "/flows/authorization-code" },
  { label: "Client Credentials", href: "/flows/client-credentials" },
];

export const AppShell: FC<AppShellProps> = ({ currentPath, main, response }) => {
  return (
    <Box className="app-shell">
      <Box className="app-rail" p="md">
        <Stack gap="md" align="center">
          <ActionIcon
            variant="filled"
            size="xl"
            aria-label="OAuth/OIDC Playground"
            color="dark"
            styles={{
              root: {
                backgroundColor: "#2b313d",
                color: "#f5f6f8",
                border: "1px solid #3b4250",
              },
            }}
          >
            <IconShieldLock size={22} />
          </ActionIcon>
          <Text size="xs" c="gray.3" fw={700} tt="uppercase" lts={1}>
            OAuth
          </Text>
          <Divider color="#2b313d" w="100%" />
          <Tooltip label="Settings" position="right">
            <ActionIcon
              variant="filled"
              size="lg"
              color="dark"
              aria-label="Settings"
              component="a"
              href="/settings"
              styles={{
                root: {
                  backgroundColor: "#2b313d",
                  color: "#f5f6f8",
                  border: "1px solid #3b4250",
                },
              }}
            >
              <IconAdjustments size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Import settings" position="right">
            <ActionIcon
              variant="filled"
              size="lg"
              color="dark"
              aria-label="Import settings"
              styles={{
                root: {
                  backgroundColor: "#2b313d",
                  color: "#f5f6f8",
                  border: "1px solid #3b4250",
                },
              }}
            >
              <IconFileUpload size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Export settings" position="right">
            <ActionIcon
              variant="filled"
              size="lg"
              color="dark"
              aria-label="Export settings"
              styles={{
                root: {
                  backgroundColor: "#2b313d",
                  color: "#f5f6f8",
                  border: "1px solid #3b4250",
                },
              }}
            >
              <IconFileDownload size={20} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Box>

      <Box className="app-nav" p="md">
        <Group justify="space-between" mb="md">
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>
              Curity Playground
            </Text>
            <Text size="xs" c="dimmed">
              OAuth tools
            </Text>
          </div>
        </Group>
        <ScrollArea h="calc(100vh - 96px)" type="auto">
          <Stack gap={4}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                label={item.label}
                active={currentPath === item.href}
                component="a"
                href={item.href}
                variant="light"
                color="dark"
                leftSection={
                  <Badge size="xs" color="dark" variant="filled">
                    FLOW
                  </Badge>
                }
                styles={{
                  root: {
                    borderRadius: 8,
                  },
                }}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Box>

      <Box className="app-main" p="lg">
        <ScrollArea h="calc(100vh - 48px)" type="auto">
          {main}
        </ScrollArea>
      </Box>

      <Box className="app-detail" p="lg">
        <ScrollArea h="calc(100vh - 48px)" type="auto">
          {response ?? (
            <Text size="sm" c="dimmed">
              Run a flow to see response details here.
            </Text>
          )}
        </ScrollArea>
      </Box>
    </Box>
  );
};
