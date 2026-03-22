/**
 * PKCE (Proof Key for Code Exchange) utilities using Web Crypto API
 * RFC 7636: https://tools.ietf.org/html/rfc7636
 */

/**
 * Base64URL encode a Uint8Array
 */
function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate a cryptographically random code verifier
 * @returns A URL-safe string of 43-128 characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate a code challenge from a code verifier
 * @param verifier The code verifier
 * @param method The challenge method ('S256' or 'plain')
 * @returns The code challenge
 */
export async function generateCodeChallenge(
  verifier: string,
  method: "S256" | "plain" = "S256"
): Promise<string> {
  if (method === "plain") {
    return verifier;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Generate both code verifier and code challenge
 * @param method The challenge method ('S256' or 'plain')
 * @returns An object containing both verifier and challenge
 */
export async function generatePKCEPair(
  method: "S256" | "plain" = "S256"
): Promise<{ verifier: string; challenge: string; method: string }> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier, method);
  return { verifier, challenge, method };
}
