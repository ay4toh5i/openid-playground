import type { ClientAuthMethod, ClientKind, JwtView } from "./flowTypes.ts";

export function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function formatBody(text: string) {
  const parsed = safeJsonParse(text);
  if (parsed) {
    return JSON.stringify(parsed, null, 2);
  }
  return text;
}

export function randomId() {
  return crypto.randomUUID();
}

export function encodeBasicAuth(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  const bytes = new TextEncoder().encode(raw);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function buildPkceChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function randomVerifier(length = 64) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => charset[byte % charset.length]).join("");
}

export async function executeRequest(
  endpoint: string,
  method: "POST" | "GET",
  headers: Record<string, string>,
  body?: URLSearchParams,
) {
  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: method === "POST" && body ? body : undefined,
    });
    const text = await response.text();
    const headerEntries: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerEntries[key] = value;
    });
    return {
      ok: response.ok,
      status: response.status,
      headers: headerEntries,
      body: formatBody(text),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      headers: {},
      body: "",
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

function decodeJwtSegment(segment: string) {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token?: string): JwtView {
  if (!token) return {};
  const parts = token.split(".");
  if (parts.length < 2) {
    return { error: "Not a JWT" };
  }
  try {
    const header = JSON.stringify(
      JSON.parse(decodeJwtSegment(parts[0])),
      null,
      2,
    );
    const payload = JSON.stringify(
      JSON.parse(decodeJwtSegment(parts[1])),
      null,
      2,
    );
    return { header, payload };
  } catch {
    return { error: "Failed to decode JWT" };
  }
}

export function normalizeAuthMethod(
  kind: ClientKind,
  method: ClientAuthMethod,
) {
  if (kind === "public") return "none";
  return method;
}
