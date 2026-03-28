/**
 * Generate an EC P-256 key pair for use with ES256 algorithm.
 * Used for both private_key_jwt client authentication and DPoP.
 */
export async function generateECKeyPair(): Promise<{
  privateKeyJwk: JsonWebKey;
  publicKeyJwk: JsonWebKey;
}> {
  const keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  const [privateKeyJwk, publicKeyJwk] = await Promise.all([
    crypto.subtle.exportKey("jwk", keyPair.privateKey),
    crypto.subtle.exportKey("jwk", keyPair.publicKey),
  ]);
  return { privateKeyJwk, publicKeyJwk };
}

/**
 * Export a CryptoKey as JWK.
 */
export async function exportKeyAsJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}

/**
 * Import an EC P-256 private key JWK and derive the corresponding public key JWK.
 * Validates that the JWK is a valid extractable EC P-256 private key.
 * Throws if the JWK is invalid or not an EC P-256 key.
 */
export async function importECPrivateKeyJwk(
  jwk: JsonWebKey,
): Promise<{ privateKeyJwk: JsonWebKey; publicKeyJwk: JsonWebKey }> {
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d) {
    throw new Error("Invalid JWK: must be an EC P-256 private key (kty=EC, crv=P-256, with d)");
  }
  // Round-trip through WebCrypto to validate the key
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", privateKey);
  // Derive public key JWK by stripping the private component
  const { d: _d, key_ops: _ops, ...publicKeyJwk } = privateKeyJwk;
  return { privateKeyJwk, publicKeyJwk };
}
