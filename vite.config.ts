import { defineConfig } from "npm:vite";
import honox from "npm:honox@0.1.53/vite";

export default defineConfig({
  cacheDir: ".vite",
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  ssr: {
    external: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["honox/client", "react", "react-dom/client"],
  },
  plugins: [
    honox({
      client: {
        input: ["/app/client.ts"],
      },
    }),
  ],
});
