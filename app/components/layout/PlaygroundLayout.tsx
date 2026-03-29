import { useMantineColorScheme } from "@mantine/core";
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 200px 1fr 350px",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Icons Column - 48px */}
      <div
        style={{
          height: "100vh",
          borderRight: `1px solid ${borderColor}`,
          padding: "8px 0",
          overflowY: "auto",
        }}
      >
        <Toolbar />
      </div>

      {/* Flows Column - 200px */}
      <div
        style={{
          height: "100vh",
          borderRight: `1px solid ${borderColor}`,
          padding: "16px 8px",
          overflowY: "auto",
        }}
      >
        <Sidebar currentFlow={currentFlow} />
      </div>

      {/* Main Column - Flexible */}
      <div
        style={{
          height: "100vh",
          borderRight: `1px solid ${borderColor}`,
          padding: "16px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {children}
      </div>

      {/* Inspector Column - 350px */}
      <div
        style={{
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
      </div>
    </div>
  );
}
