import type { UserinfoForm } from "../../lib/formTypes.ts";

export type UserinfoPanelProps = {
  form: UserinfoForm;
  setForm: (updater: (prev: UserinfoForm) => UserinfoForm) => void;
  curl: string;
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
  onRun: () => void;
  onCopy: (value: string) => void;
  accessTokenHint?: string;
};

export default function UserinfoPanel({
  form,
  setForm,
  curl,
  autoRun,
  setAutoRun,
  onRun,
  onCopy,
  accessTokenHint,
}: UserinfoPanelProps) {
  return (
    <article className="panel">
      <h2>Userinfo</h2>
      <p>Call the userinfo endpoint with an access token.</p>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">1</span>
          <h3>Configure Request</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Userinfo Endpoint
              <input
                value={form.userinfoEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    userinfoEndpoint: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Access Token
              <input
                value={form.accessToken}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    accessToken: event.target.value,
                  }))}
                placeholder={accessTokenHint ?? ""}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">2</span>
          <h3>Execute Request</h3>
        </div>
        <div className="section">
          <div className="inline">
            <button className="primary" type="button" onClick={onRun}>
              Execute Userinfo
            </button>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(event) => setAutoRun(event.target.checked)}
              />
              Auto execute
            </label>
            <button
              className="ghost"
              type="button"
              onClick={() => onCopy(curl)}
            >
              Copy curl
            </button>
          </div>
          <div className="output">{curl}</div>
        </div>
      </div>
    </article>
  );
}
