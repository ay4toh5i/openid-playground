/**
 * Flow selector with flow type cards
 */
import { Stack, Card, Text, Badge } from "@mantine/core";
import { usePlayground, type FlowType } from "../../hooks/usePlaygroundState";

interface FlowCardProps {
  type: FlowType;
  title: string;
  description: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

function FlowCard({ type, title, description, disabled, comingSoon }: FlowCardProps) {
  const { state, dispatch } = usePlayground();
  const isSelected = state.selectedFlow === type;

  const handleClick = () => {
    if (disabled || comingSoon) return;
    dispatch({ type: "SELECT_FLOW", payload: type });
  };

  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      style={{
        cursor: disabled || comingSoon ? "not-allowed" : "pointer",
        opacity: disabled || comingSoon ? 0.5 : 1,
        borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? "var(--mantine-color-blue-0)" : undefined,
      }}
      onClick={handleClick}
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

export function FlowSelector() {
  return (
    <Stack gap="sm">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        Select Flow
      </Text>

      <FlowCard
        type="authorization_code"
        title="Authorization Code"
        description="Standard flow with code exchange and PKCE"
      />

      <FlowCard
        type="client_credentials"
        title="Client Credentials"
        description="Machine-to-machine authentication"
      />

      <FlowCard
        type="refresh_token"
        title="Refresh Token"
        description="Obtain new access token using refresh token"
      />

      <FlowCard
        type={null}
        title="Device Code"
        description="Flow for devices with limited input"
        comingSoon
      />
    </Stack>
  );
}
