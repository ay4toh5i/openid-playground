/**
 * 4-column playground layout (props-based, no context)
 */
import { Grid, useMantineColorScheme } from "@mantine/core";
import type { FlowType, TokenResponseData, AuthorizationRequestData } from "../../lib/flow-types";
import type { OIDCProviderMetadata } from "../../lib/storage/client-config";
import { IconsPanel } from "../icons-column/IconsPanel";
import { FlowSelector } from "../flows-column/FlowSelector";
import { InspectorPanel } from "../inspector-column/InspectorPanel";
import type { ReactNode } from "react";

interface PlaygroundLayoutProps {
  currentFlow: FlowType | null;
  children: ReactNode;
  tokenResponse?: TokenResponseData | null;
  providerMetadata?: OIDCProviderMetadata | null;
  authRequest?: AuthorizationRequestData | null;
}

export function PlaygroundLayout({
  currentFlow,
  children,
  tokenResponse,
  providerMetadata,
  authRequest,
}: PlaygroundLayoutProps) {
  const { colorScheme } = useMantineColorScheme();
  const borderColor =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Grid gutter={0} style={{ height: "100%", margin: 0 }}>
        {/* Icons Column - 48px */}
        <Grid.Col
          span="content"
          style={{
            width: "48px",
            height: "100vh",
            borderRight: `1px solid ${borderColor}`,
            padding: "8px 0",
            overflowY: "auto",
          }}
        >
          <IconsPanel />
        </Grid.Col>

        {/* Flows Column - ~200px */}
        <Grid.Col
          span="content"
          style={{
            width: "200px",
            height: "100vh",
            borderRight: `1px solid ${borderColor}`,
            padding: "16px 8px",
            overflowY: "auto",
          }}
        >
          <FlowSelector currentFlow={currentFlow} />
        </Grid.Col>

        {/* Main Column - Flexible */}
        <Grid.Col
          span="auto"
          style={{
            height: "100vh",
            borderRight: `1px solid ${borderColor}`,
            padding: "16px",
            overflowY: "auto",
          }}
        >
          {children}
        </Grid.Col>

        {/* Inspector Column - ~350px */}
        <Grid.Col
          span="content"
          style={{
            width: "350px",
            height: "100vh",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <InspectorPanel
            tokenResponse={tokenResponse ?? null}
            providerMetadata={providerMetadata ?? null}
            authRequest={authRequest ?? null}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}
