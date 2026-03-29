import { reactRenderer } from "@hono/react-renderer";
import { ColorSchemeScript } from "@mantine/core";

export default reactRenderer(({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <ColorSchemeScript />
        {import.meta.env.PROD ? (
          <>
            <link rel="stylesheet" href="/static/assets/client.css" />
            <script type="module" src="/static/client.js"></script>
          </>
        ) : (
          <script type="module" src="/app/client.ts"></script>
        )}
        {title ? <title>{title}</title> : ""}
      </head>
      <body>{children}</body>
    </html>
  );
});
