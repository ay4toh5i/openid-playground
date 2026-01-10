import type { ClientCredentialsForm } from "../../lib/formTypes.ts";
import type { ClientAuthMethod } from "../../lib/flowTypes.ts";
import { clientAuthOptions } from "../../lib/flowTypes.ts";
import { normalizeAuthMethod } from "../../lib/utils.ts";

export type ClientCredentialsPanelProps = {
  form: ClientCredentialsForm;
  setForm: (
    updater: (prev: ClientCredentialsForm) => ClientCredentialsForm,
  ) => void;
  isPublicClient: boolean;
  payload: URLSearchParams;
  curl: string;
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
  onRun: () => void;
  onCopy: (value: string) => void;
};

export default function ClientCredentialsPanel({
  form,
  setForm,
  isPublicClient,
  payload,
  curl,
  autoRun,
  setAutoRun,
  onRun,
  onCopy,
}: ClientCredentialsPanelProps) {
  return (
    <article className="panel">
      <h2>Client Credentials</h2>
      <p>Request access tokens with client authentication.</p>
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
              Scope
              <input
                value={form.scope}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    scope: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Audience
              <input
                value={form.audience}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    audience: event.target.value,
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
              Execute Client Credentials
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
