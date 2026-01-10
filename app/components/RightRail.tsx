import type { FlowId, JwtView } from "../lib/flowTypes.ts";

export type RightRailProps = {
  activeFlow: FlowId;
  accessToken?: string;
  idToken?: string;
  decodedAccess: JwtView;
  decodedId: JwtView;
  refreshToken?: string;
  stepResults: string[];
  onCopy: (value: string) => void;
};

export default function RightRail({
  activeFlow,
  accessToken,
  idToken,
  decodedAccess,
  decodedId,
  refreshToken,
  stepResults,
  onCopy,
}: RightRailProps) {
  return (
    <aside className="right-rail">
      <section className="panel token-panel">
        <div className="token-header">
          <strong>Access Token</strong>
          <button
            className="ghost"
            type="button"
            onClick={() => onCopy(accessToken ?? "")}
          >
            Copy
          </button>
        </div>
        <div className="token-content">
          {accessToken || "No access token yet."}
        </div>
      </section>

      <section className="panel token-panel warn">
        <div className="token-header">
          <strong>ID Token</strong>
          <button
            className="ghost"
            type="button"
            onClick={() => onCopy(idToken ?? "")}
          >
            Copy
          </button>
        </div>
        <div className="token-content">
          {idToken || "No id_token returned yet."}
        </div>
      </section>

      <section className="panel">
        <h3>Decoded Access Token</h3>
        {decodedAccess.error && <p>{decodedAccess.error}</p>}
        {decodedAccess.header && (
          <div className="section">
            <div className="output">{decodedAccess.header}</div>
            <div className="output">{decodedAccess.payload}</div>
          </div>
        )}
        {!decodedAccess.header && !decodedAccess.error && (
          <p>Paste or fetch a JWT to inspect headers and claims.</p>
        )}
      </section>

      <section className="panel">
        <h3>Decoded ID Token</h3>
        {decodedId.error && <p>{decodedId.error}</p>}
        {decodedId.header && (
          <div className="section">
            <div className="output">{decodedId.header}</div>
            <div className="output">{decodedId.payload}</div>
          </div>
        )}
        {!decodedId.header && !decodedId.error && (
          <p>ID token appears after a successful code flow.</p>
        )}
      </section>

      {refreshToken && (
        <section className="panel token-panel">
          <div className="token-header">
            <strong>Refresh Token</strong>
            <button
              className="ghost"
              type="button"
              onClick={() => onCopy(refreshToken)}
            >
              Copy
            </button>
          </div>
          <div className="token-content">{refreshToken}</div>
        </section>
      )}

      <section className="panel">
        <h3>Step Results ({activeFlow})</h3>
        <div className="section">
          {stepResults.map((result, index) => (
            <div className="output" key={`${activeFlow}-${index}`}>
              {result}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
