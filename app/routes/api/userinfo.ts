import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

interface UserinfoRequest {
  userinfoEndpoint: string;
  accessToken: string;
  dpopProof?: string;
}

const app = new Hono();

app.post("/", async (c) => {
  const { userinfoEndpoint, accessToken, dpopProof } = await c.req.json<UserinfoRequest>();

  if (!userinfoEndpoint || !accessToken) {
    return c.json(
      {
        error: "invalid_request",
        error_description: "userinfoEndpoint and accessToken are required",
      },
      400,
    );
  }

  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  });

  if (dpopProof) {
    headers.set("DPoP", dpopProof);
  }

  const response = await fetch(userinfoEndpoint, { headers });
  const data = await response.json();
  return c.json(data, response.status as ContentfulStatusCode);
});

export default app;
