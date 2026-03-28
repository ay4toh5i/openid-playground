import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono();

app.get("/", async (c) => {
  const issuer = c.req.query("issuer");
  if (!issuer) {
    return c.json({ error: "invalid_request", error_description: "issuer is required" }, 400);
  }

  const normalizedIssuer = issuer.replace(/\/$/, "");
  const wellKnownUrl = `${normalizedIssuer}/.well-known/openid-configuration`;

  try {
    const response = await fetch(wellKnownUrl);
    const data = await response.json();
    return c.json(data, response.status as ContentfulStatusCode);
  } catch (error) {
    return c.json(
      {
        error: "server_error",
        error_description: error instanceof Error ? error.message : "Failed to fetch metadata",
      },
      500,
    );
  }
});

export default app;
