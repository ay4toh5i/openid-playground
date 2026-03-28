import type { JWK } from "jose";
import { importJWK, SignJWT } from "jose";

/**
 * Generate a DPoP proof JWT per RFC 9449.
 * The proof binds the request to the key pair and must be freshly generated per request.
 */
export async function generateDPoPProof(
  privateKeyJwk: JsonWebKey,
  publicKeyJwk: JsonWebKey,
  method: string,
  url: string,
): Promise<string> {
  const privateKey = await importJWK(privateKeyJwk as JWK, "ES256");
  return new SignJWT({
    jti: crypto.randomUUID(),
    htm: method.toUpperCase(),
    htu: url,
  })
    .setProtectedHeader({ typ: "dpop+jwt", alg: "ES256", jwk: publicKeyJwk as JWK })
    .setIssuedAt()
    .sign(privateKey);
}
