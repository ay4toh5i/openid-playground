import { Tabs, Stack, Badge, Text } from "@mantine/core";
import { useMemo, useState, useEffect } from "react";
import { decodeJWT, verifyJWT, isJWTExpired, getTimeUntilExpiration } from "../../lib/jwt/decoder";
import { CodeBlock } from "../common/CodeBlock";

interface JwtInspectorProps {
  token: string;
  label?: string;
  jwksUri?: string;
  expectedNonce?: string;
}

export function JwtInspector({ token, label, jwksUri, expectedNonce }: JwtInspectorProps) {
  const decoded = useMemo(() => {
    try {
      return decodeJWT(token);
    } catch {
      return null;
    }
  }, [token]);

  const isExpired = decoded ? isJWTExpired(decoded.payload) : false;
  const nonceValid = decoded && expectedNonce ? decoded.payload.nonce === expectedNonce : null;

  // Async signature verification - legitimate useEffect (external system)
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwksUri || !decoded) {
      return;
    }
    setVerified(null);
    setVerifyError(null);
    void verifyJWT(token, jwksUri).then((result) => {
      setVerified(result.verified);
      setVerifyError(result.error ?? null);
    });
  }, [token, jwksUri]);

  // Timer countdown - legitimate useEffect (subscription to time)
  const [timeLeft, setTimeLeft] = useState<number | null>(() =>
    decoded ? getTimeUntilExpiration(decoded.payload) : null,
  );

  useEffect(() => {
    const exp = decoded?.payload.exp;
    if (!exp) {
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilExpiration(decoded.payload));
    }, 1000);
    return () => clearInterval(interval);
  }, [decoded?.payload.exp]);

  if (!decoded) {
    return (
      <Text size="sm" c="dimmed">
        Failed to decode JWT
      </Text>
    );
  }

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
        {!isExpired && timeLeft !== null && <Badge color="blue">Expires in {timeLeft}s</Badge>}
      </div>

      <Tabs defaultValue="payload">
        <Tabs.List>
          <Tabs.Tab value="header">Header</Tabs.Tab>
          <Tabs.Tab value="payload">Payload</Tabs.Tab>
          <Tabs.Tab value="signature">Signature</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="header" pt="sm">
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <CodeBlock code={JSON.stringify(decoded.header, null, 2)} lang="json" />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="payload" pt="sm">
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <CodeBlock code={JSON.stringify(decoded.payload, null, 2)} lang="json" />
          </div>
          <Stack gap="xs" mt="sm">
            <Text size="xs" fw={600} c="dimmed">
              Standard Claims:
            </Text>
            {!!decoded.payload.iss && (
              <Text size="xs">
                <strong>Issuer:</strong> {JSON.stringify(decoded.payload.iss).replace(/^"|"$/g, "")}
              </Text>
            )}
            {!!decoded.payload.sub && (
              <Text size="xs">
                <strong>Subject:</strong>{" "}
                {JSON.stringify(decoded.payload.sub).replace(/^"|"$/g, "")}
              </Text>
            )}
            {!!decoded.payload.aud && (
              <Text size="xs">
                <strong>Audience:</strong>{" "}
                {JSON.stringify(decoded.payload.aud).replace(/^"|"$/g, "")}
              </Text>
            )}
            {!!decoded.payload.exp && (
              <Text size="xs">
                <strong>Expires:</strong>{" "}
                {new Date((decoded.payload.exp as number) * 1000).toLocaleString()}
              </Text>
            )}
            {!!decoded.payload.iat && (
              <Text size="xs">
                <strong>Issued At:</strong>{" "}
                {new Date((decoded.payload.iat as number) * 1000).toLocaleString()}
              </Text>
            )}
            {!!decoded.payload.nonce && (
              <Text size="xs">
                <strong>Nonce:</strong>{" "}
                {JSON.stringify(decoded.payload.nonce).replace(/^"|"$/g, "")}
              </Text>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="signature" pt="sm">
          <Stack gap="sm">
            <CodeBlock code={decoded.signature} lang="text" style={{ wordBreak: "break-all" }} />
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
