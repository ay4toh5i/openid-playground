import type { LogoutForm } from "../../lib/formTypes.ts";

export type LogoutPanelProps = {
  form: LogoutForm;
  setForm: (updater: (prev: LogoutForm) => LogoutForm) => void;
  logoutUrl: string;
  onOpen: () => void;
  onCopy: (value: string) => void;
  idTokenHint?: string;
};

export default function LogoutPanel({
  form,
  setForm,
  logoutUrl,
  onOpen,
  onCopy,
  idTokenHint,
}: LogoutPanelProps) {
  return (
    <article className="panel">
      <h2>Logout</h2>
      <p>Generate the end-session URL for OIDC logout.</p>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">1</span>
          <h3>Configure Logout</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              End Session Endpoint
              <input
                value={form.endSessionEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    endSessionEndpoint: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              ID Token Hint
              <input
                value={form.idTokenHint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    idTokenHint: event.target.value,
                  }))}
                placeholder={idTokenHint ?? ""}
              />
            </label>
          </div>
          <div className="row">
            <label className="field">
              Post Logout Redirect URI
              <input
                value={form.postLogoutRedirectUri}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    postLogoutRedirectUri: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              State
              <input
                value={form.state}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    state: event.target.value,
                  }))}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">2</span>
          <h3>Open URL</h3>
        </div>
        <div className="section">
          <div className="inline">
            <button
              className="ghost"
              type="button"
              onClick={onOpen}
              disabled={!logoutUrl}
            >
              Open Logout URL
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => onCopy(logoutUrl)}
            >
              Copy logout URL
            </button>
          </div>
          <div className="output">{logoutUrl}</div>
        </div>
      </div>
    </article>
  );
}
