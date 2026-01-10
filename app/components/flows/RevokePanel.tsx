import type { RevokeForm } from "../../lib/formTypes.ts";
import type { ClientAuthMethod } from "../../lib/flowTypes.ts";
import { clientAuthOptions } from "../../lib/flowTypes.ts";
import { normalizeAuthMethod } from "../../lib/utils.ts";

export type RevokePanelProps = {
  form: RevokeForm;
  setForm: (updater: (prev: RevokeForm) => RevokeForm) => void;
  isPublicClient: boolean;
  payload: URLSearchParams;
  curl: string;
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
  onRun: () => void;
  onCopy: (value: string) => void;
};

export default function RevokePanel({
  form,
  setForm,
  isPublicClient,
  payload,
  curl,
  autoRun,
  setAutoRun,
  onRun,
  onCopy,
}: RevokePanelProps) {
  return (
    <article className="panel">
      <h2>Revoke Token</h2>
      <p>Revoke access or refresh tokens.</p>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">1</span>
          <h3>Configure Request</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Revocation Endpoint
              <input
                value={form.revokeEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    revokeEndpoint: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Token
              <input
                value={form.token}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    token: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Token Type Hint
              <input
                value={form.tokenTypeHint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    tokenTypeHint: event.target.value,
                  }))}
              />
            </label>
          </div>
          <div className="row">
            <label className="field">
              Client ID
              <input
                value={form.clientId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    clientId: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Client Secret
              <input
                value={form.clientSecret}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    clientSecret: event.target.value,
                  }))}
                disabled={form.authMethod === "none" || isPublicClient}
              />
            </label>
            <label className="field">
              Auth Method
              <select
                value={form.authMethod}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    authMethod: normalizeAuthMethod(
                      isPublicClient ? "public" : "confidential",
                      event.target.value as ClientAuthMethod,
                    ),
                  }))}
                disabled={isPublicClient}
              >
                {clientAuthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {form.authMethod === "private_key_jwt" && (
            <label className="field">
              Client Assertion (JWT)
              <textarea
                value={form.clientAssertion}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    clientAssertion: event.target.value,
                  }))}
              />
            </label>
          )}
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
              Execute Revoke
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
          <div className="output">{payload.toString()}</div>
          <div className="output">{curl}</div>
        </div>
      </div>
    </article>
  );
}
