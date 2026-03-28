import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono();

app.post("/", async (c) => {
  try {
    const { tokenEndpoint, headers, body } = await c.req.json<{
      tokenEndpoint: string;
      headers: Record<string, string>;
      body: string;
    }>();

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json();
    return c.json(data, response.status as ContentfulStatusCode);
  } catch (error) {
    return c.json({ error: "proxy_error", error_description: String(error) }, 500);
  }
});

export default app;
