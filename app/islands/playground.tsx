/**
 * Main playground island with state management
 */
import { useState, useEffect } from "react";
import { MantineProvider, localStorageColorSchemeManager, createTheme } from "@mantine/core";
import { PlaygroundProvider } from "../hooks/usePlaygroundState";
import { PlaygroundLayout } from "../components/layout/PlaygroundLayout";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "oidc-playground-color-scheme",
});

const theme = createTheme({
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  defaultGradient: {
    from: 'blue',
    to: 'cyan',
    deg: 45,
  },
});

export default function Playground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh" }}>Loading...</div>;
  }

  return (
    <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="light">
      <PlaygroundProvider>
        <PlaygroundLayout />
      </PlaygroundProvider>
    </MantineProvider>
  );
}
