import { useEffect, useState } from "react";

export default function OAuthCallback() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    try {
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.substring(1));

      // Extract callback data from query or fragment
      const code = params.get("code") || hash.get("code");
      const state = params.get("state") || hash.get("state");
      const error = params.get("error") || hash.get("error");
      const errorDescription = params.get("error_description") || hash.get("error_description");

      setDebugInfo(`Code: ${code}\nState: ${state}\nError: ${error}\nOpener: ${!!window.opener}`);

      // Send message to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "oauth_callback",
            code: code || undefined,
            state: state || undefined,
            error: error || undefined,
            error_description: errorDescription || undefined,
          },
          window.location.origin,
        );

        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      }
    } catch (err) {
      setDebugInfo(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, [mounted]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>Processing Authorization...</h1>
      <p>This window should close automatically.</p>
      <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        If it doesn't close, you can safely close it manually.
      </p>
      {debugInfo && (
        <pre
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#999",
            textAlign: "left",
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {debugInfo}
        </pre>
      )}
    </div>
  );
}
