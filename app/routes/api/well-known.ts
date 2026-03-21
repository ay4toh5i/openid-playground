import { createRoute } from "honox/factory";
import type { OpenIDConfiguration } from "../../lib/oauth/types";

export default createRoute(async (c) => {
  const issuerUrl = c.req.query("issuer");

  if (!issuerUrl) {
    return c.json({ error: "Missing issuer parameter" }, 400);
  }

  try {
    // Normalize the issuer URL
    let normalizedUrl = issuerUrl.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    if (normalizedUrl.endsWith("/")) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    const wellKnownUrl = `${normalizedUrl}/.well-known/openid-configuration`;

    const response = await fetch(wellKnownUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return c.json(
        {
          error: `Failed to fetch well-known configuration: ${response.status} ${response.statusText}`,
        },
        response.status as 400 | 404 | 500,
      );
    }

    const config: OpenIDConfiguration = await response.json();

    // Validate required fields
    if (!config.issuer || !config.authorization_endpoint || !config.token_endpoint) {
      return c.json(
        {
          error: "Invalid well-known configuration: missing required fields",
        },
        400,
      );
    }

    return c.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: `Failed to fetch well-known configuration: ${message}` }, 500);
  }
});
