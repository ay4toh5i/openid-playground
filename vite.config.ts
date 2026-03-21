import build from "@hono/vite-build/cloudflare-workers";
import devServer from "@hono/vite-dev-server";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {
        rollupOptions: {
          input: ["./app/client.tsx"],
          output: {
            entryFileNames: "static/client.js",
            chunkFileNames: "static/assets/[name]-[hash].js",
            assetFileNames: "static/assets/[name].[ext]",
          },
        },
        emptyOutDir: false,
      },
    };
  } else {
    return {
      ssr: {
        external: ["react", "react-dom"],
      },
      plugins: [
        honox(),
        devServer({
          entry: "app/server.ts",
          exclude: [
            /.*\.css(\?.*)?$/,
            /.*\.ts(\?.*)?$/,
            /.*\.tsx(\?.*)?$/,
            /.*\.js(\?.*)?$/,
            /^\/@.+$/,
            /\?t=\d+$/,
            /\?v=\w+$/,
            /^\/favicon\.ico$/,
            /^\/static\/.+/,
            /^\/node_modules\/.*/,
          ],
        }),
        build(),
      ],
    };
  }
});
