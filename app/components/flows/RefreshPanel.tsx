import type { RefreshForm } from "../../lib/formTypes.ts";
import type { ClientAuthMethod } from "../../lib/flowTypes.ts";
import { clientAuthOptions } from "../../lib/flowTypes.ts";
import { normalizeAuthMethod } from "../../lib/utils.ts";

export type RefreshPanelProps = {
  form: RefreshForm;
  setForm: (updater: (prev: RefreshForm) => RefreshForm) => void;
  isPublicClient: boolean;
  payload: URLSearchParams;
  curl: string;
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
  onRun: () => void;
  onCopy: (value: string) => void;
  refreshTokenHint?: string;
};

export default function RefreshPanel({
  form,
  setForm,
  isPublicClient,
  payload,
  curl,
  autoRun,
  setAutoRun,
  onRun,
  onCopy,
  refreshTokenHint,
}: RefreshPanelProps) {
  return (
    <article className="panel">
      <h2>Refresh Token</h2>
      <p>Exchange refresh tokens for new access tokens.</p>
      <div className="step-card">
        <div className="step-header">
          <span className="step-index">1</span>
          <h3>Configure Request</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Token Endpoint
              <input
                value={form.tokenEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    tokenEndpoint: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Refresh Token
              <input
                value={form.refreshToken}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    refreshToken: event.target.value,
                  }))}
                placeholder={refreshTokenHint ?? ""}
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
              Execute Refresh
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
