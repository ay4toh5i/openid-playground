import { createClient } from "honox/client";

createClient({
  hydrate: async (elem, root) => {
    const { hydrateRoot } = await import("react-dom/client");
    const { MantineProvider } = await import("@mantine/core");
    hydrateRoot(
      root,
      <MantineProvider
        defaultColorScheme="light"
        theme={{
          primaryColor: "dark",
          fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
          primaryShade: 9,
        }}
      >
        {elem}
      </MantineProvider>,
    );
  },
  createElement: async (type, props) => {
    const { createElement } = await import("react");
    const { MantineProvider } = await import("@mantine/core");
    return createElement(
      MantineProvider,
      {
        defaultColorScheme: "light",
        theme: {
          primaryColor: "dark",
          fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
          primaryShade: 9,
        },
      },
      createElement(type, props),
    );
  },
});
