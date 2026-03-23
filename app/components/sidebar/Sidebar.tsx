import { Stack, Card, Text, Badge } from "@mantine/core";
import type { FlowType } from "../../lib/oidc";

interface FlowCardProps {
  href?: string;
  title: string;
  description: string;
  isActive?: boolean;
  comingSoon?: boolean;
}

function FlowCard({ href, title, description, isActive, comingSoon }: FlowCardProps) {
  const isClickable = !!href && !comingSoon;
  return (
    <Card
      component={isClickable ? "a" : "div"}
      href={isClickable ? href : undefined}
      padding="sm"
      radius="md"
      withBorder
      style={{
        cursor: comingSoon ? "not-allowed" : isClickable ? "pointer" : "default",
        opacity: comingSoon ? 0.5 : 1,
        borderColor: isActive ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: isActive ? 2 : 1,
        backgroundColor: isActive ? "var(--mantine-color-blue-0)" : undefined,
        textDecoration: "none",
      }}
    >
      <Stack gap="xs">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Text size="sm" fw={600}>
            {title}
          </Text>
          {comingSoon && (
            <Badge size="xs" variant="light" color="gray">
              Soon
            </Badge>
          )}
        </div>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Card>
  );
}

export function Sidebar({ currentFlow }: { currentFlow: FlowType | null }) {
  return (
    <Stack gap="sm">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        Select Flow
      </Text>

      <FlowCard
        href="/flows/authorization-code"
        isActive={currentFlow === "authorization_code"}
        title="Authorization Code"
        description="Standard flow with code exchange and PKCE"
      />

      <FlowCard
        href="/flows/client-credentials"
        isActive={currentFlow === "client_credentials"}
        title="Client Credentials"
        description="Machine-to-machine authentication"
      />

      <FlowCard
        href="/flows/refresh-token"
        isActive={currentFlow === "refresh_token"}
        title="Refresh Token"
        description="Obtain new access token using refresh token"
      />

      <FlowCard title="Device Code" description="Flow for devices with limited input" comingSoon />
    </Stack>
  );
}
