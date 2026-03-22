/**
 * JWT inspector with header, payload, and signature tabs
 */
import { Tabs, Code, Stack, Badge, Text } from "@mantine/core";
import { decodeJWT, verifyJWT, isJWTExpired, getTimeUntilExpiration } from "../../lib/jwt/decoder";
import { useEffect, useState } from "react";
import type { OIDCProviderMetadata } from "../../lib/storage/client-config";

interface JwtInspectorProps {
  token: string;
  label?: string;
  jwksUri?: string;
  expectedNonce?: string;
}

export function JwtInspector({ token, label, jwksUri, expectedNonce }: JwtInspectorProps) {
  const [decoded, setDecoded] = useState<ReturnType<typeof decodeJWT> | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [nonceValid, setNonceValid] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const decodedToken = decodeJWT(token);
      setDecoded(decodedToken);

      // Check nonce if expected nonce is provided
      if (expectedNonce) {
        const tokenNonce = decodedToken.payload.nonce;
        if (tokenNonce === expectedNonce) {
          setNonceValid(true);
        } else {
          setNonceValid(false);
        }
      }

      // Update time left
      const time = getTimeUntilExpiration(decodedToken.payload);
      setTimeLeft(time);

      // Set up interval to update time left
      if (time !== null) {
        const interval = setInterval(() => {
          const newTime = getTimeUntilExpiration(decodedToken.payload);
          setTimeLeft(newTime);
        }, 1000);
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  }, [token, expectedNonce]);

  useEffect(() => {
    if (jwksUri && decoded) {
      verifyJWT(token, jwksUri).then((result) => {
        setVerified(result.verified);
        setVerifyError(result.error || null);
      });
    }
  }, [token, jwksUri, decoded]);

  if (!decoded) {
    return <Text size="sm" c="dimmed">Failed to decode JWT</Text>;
  }

  const isExpired = isJWTExpired(decoded.payload);

  return (
    <Stack gap="sm">
      {label && (
        <Text size="sm" fw={600}>
          {label}
        </Text>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {verified === true && <Badge color="green">Signature Valid</Badge>}
        {verified === false && <Badge color="red">Signature Invalid</Badge>}
        {nonceValid === true && <Badge color="green">Nonce Valid</Badge>}
        {nonceValid === false && <Badge color="red">Nonce Mismatch</Badge>}
        {isExpired && <Badge color="red">Expired</Badge>}
        {!isExpired && timeLeft !== null && (
          <Badge color="blue">Expires in {timeLeft}s</Badge>
        )}
      </div>

      <Tabs defaultValue="payload">
        <Tabs.List>
          <Tabs.Tab value="header">Header</Tabs.Tab>
          <Tabs.Tab value="payload">Payload</Tabs.Tab>
          <Tabs.Tab value="signature">Signature</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="header" pt="sm">
          <Code block style={{ fontSize: "11px", maxHeight: "300px", overflowY: "auto" }}>
            {JSON.stringify(decoded.header, null, 2)}
          </Code>
        </Tabs.Panel>

        <Tabs.Panel value="payload" pt="sm">
          <Code block style={{ fontSize: "11px", maxHeight: "300px", overflowY: "auto" }}>
            {JSON.stringify(decoded.payload, null, 2)}
          </Code>
          <Stack gap="xs" mt="sm">
            <Text size="xs" fw={600} c="dimmed">
              Standard Claims:
            </Text>
            {decoded.payload.iss && (
              <Text size="xs">
                <strong>Issuer:</strong> {String(decoded.payload.iss)}
              </Text>
            )}
            {decoded.payload.sub && (
              <Text size="xs">
                <strong>Subject:</strong> {String(decoded.payload.sub)}
              </Text>
            )}
            {decoded.payload.aud && (
              <Text size="xs">
                <strong>Audience:</strong> {String(decoded.payload.aud)}
              </Text>
            )}
            {decoded.payload.exp && (
              <Text size="xs">
                <strong>Expires:</strong>{" "}
                {new Date((decoded.payload.exp as number) * 1000).toLocaleString()}
              </Text>
            )}
            {decoded.payload.iat && (
              <Text size="xs">
                <strong>Issued At:</strong>{" "}
                {new Date((decoded.payload.iat as number) * 1000).toLocaleString()}
              </Text>
            )}
            {decoded.payload.nonce && (
              <Text size="xs">
                <strong>Nonce:</strong> {String(decoded.payload.nonce)}
              </Text>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="signature" pt="sm">
          <Stack gap="sm">
            <Code block style={{ fontSize: "11px", wordBreak: "break-all" }}>
              {decoded.signature}
            </Code>
            {jwksUri ? (
              <div>
                {verified === true && (
                  <Text size="sm" c="green">
                    ✓ Signature verified successfully
                  </Text>
                )}
                {verified === false && (
                  <Text size="sm" c="red">
                    ✗ Signature verification failed: {verifyError}
                  </Text>
                )}
                {verified === null && (
                  <Text size="sm" c="dimmed">
                    Verifying signature...
                  </Text>
                )}
              </div>
            ) : (
              <Text size="sm" c="dimmed">
                No JWKS URI available for verification
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
