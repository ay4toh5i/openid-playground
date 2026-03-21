import { reactRenderer } from "@hono/react-renderer";
import { Link, Script } from "honox/server";
import { MantineProvider } from "@mantine/core";
export default reactRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.tsx" async />
      </head>
      <body>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            primaryColor: "dark",
            fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
            primaryShade: 9,
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
});
