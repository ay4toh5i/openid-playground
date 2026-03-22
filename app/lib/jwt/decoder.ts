/**
 * JWT decoding and verification utilities using jose library
 */
import { decodeJwt, decodeProtectedHeader, createRemoteJWKSet, jwtVerify } from "jose";

export interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: string;
}

/**
 * Detect if a token is JWT format or opaque
 * @param token The token to check
 * @returns 'jwt' if token appears to be JWT, 'opaque' otherwise
 */
export function detectTokenType(token: string): "jwt" | "opaque" {
  // JWT has 3 parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) {
    return "opaque";
  }

  // Try to decode - if it fails, it's probably opaque
  try {
    decodeJwt(token);
    return "jwt";
  } catch {
    return "opaque";
  }
}

/**
 * Decode a JWT without verification
 * @param token The JWT to decode
 * @returns The decoded JWT parts
 */
export function decodeJWT(token: string): DecodedJWT {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const header = decodeProtectedHeader(token);
  const payload = decodeJwt(token);
  const signature = parts[2];

  return {
    header,
    payload,
    signature,
    raw: token,
  };
}

/**
 * Verify a JWT signature using JWKS
 * @param token The JWT to verify
 * @param jwksUri The JWKS URI to fetch public keys from
 * @returns The verification result
 */
export async function verifyJWT(
  token: string,
  jwksUri: string
): Promise<{ verified: boolean; error?: string; payload?: Record<string, unknown> }> {
  try {
    const JWKS = createRemoteJWKSet(new URL(jwksUri));
    const { payload } = await jwtVerify(token, JWKS);

    return {
      verified: true,
      payload: payload as Record<string, unknown>,
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}

/**
 * Check if a JWT is expired
 * @param payload The JWT payload
 * @returns true if expired, false otherwise
 */
export function isJWTExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  if (!exp) {
    return false;
  }

  return Date.now() >= exp * 1000;
}

/**
 * Get time until JWT expiration
 * @param payload The JWT payload
 * @returns Seconds until expiration, or null if no exp claim
 */
export function getTimeUntilExpiration(payload: Record<string, unknown>): number | null {
  const exp = payload.exp as number | undefined;
  if (!exp) {
    return null;
  }

  const expiresAt = exp * 1000;
  const now = Date.now();
  return Math.max(0, Math.floor((expiresAt - now) / 1000));
}
