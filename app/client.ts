import { createClient } from "honox/client";
import "@mantine/core/styles.css";

void createClient({
  hydrate: async (elem, root) => {
    const { hydrateRoot } = await import("react-dom/client");
    // @ts-expect-error: HonoX passes Node, but hydrateRoot expects ReactNode — compatible at runtime
    hydrateRoot(root, elem);
  },
  // @ts-expect-error: React.createElement returns ReactElement, not DOM Node — HonoX handles this correctly
  createElement: async (type: any, props: any) => {
    const { createElement } = await import("react");
    return createElement(type, props);
  },
});
