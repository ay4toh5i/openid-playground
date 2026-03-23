import { Grid, useMantineColorScheme } from "@mantine/core";
import type { FlowType, TokenResponse, AuthorizationRequestConfig } from "../../lib/oidc";
import type { OIDCProviderMetadata } from "../../lib/storage/client-config";
import { Toolbar } from "../toolbar/Toolbar";
import { Sidebar } from "../sidebar/Sidebar";
import { InspectorPanel } from "../inspector/InspectorPanel";
import type { ReactNode } from "react";

interface PlaygroundLayoutProps {
  currentFlow: FlowType | null;
  children: ReactNode;
  tokenResponse?: TokenResponse | null;
  providerMetadata?: OIDCProviderMetadata | null;
  authRequest?: AuthorizationRequestConfig | null;
}

export function PlaygroundLayout({
  currentFlow,
  children,
  tokenResponse,
  providerMetadata,
  authRequest,
}: PlaygroundLayoutProps) {
  const { colorScheme } = useMantineColorScheme();
  const borderColor = colorScheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";

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
          <Toolbar />
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
          <Sidebar currentFlow={currentFlow} />
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
