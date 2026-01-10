import type { AuthForm } from "../../lib/formTypes.ts";
import type { ClientAuthMethod } from "../../lib/flowTypes.ts";
import { clientAuthOptions } from "../../lib/flowTypes.ts";
import { normalizeAuthMethod } from "../../lib/utils.ts";

export type CodeFlowPanelProps = {
  authForm: AuthForm;
  setAuthForm: (updater: (prev: AuthForm) => AuthForm) => void;
  isPublicClient: boolean;
  authorizationUrl: string;
  authTokenPayload: URLSearchParams;
  authCurl: string;
  authAutoRun: boolean;
  setAuthAutoRun: (value: boolean) => void;
  onGeneratePkce: () => void;
  onOpenAuthUrl: () => void;
  onCopy: (value: string) => void;
  onRunAuthToken: () => void;
};

export default function CodeFlowPanel({
  authForm,
  setAuthForm,
  isPublicClient,
  authorizationUrl,
  authTokenPayload,
  authCurl,
  authAutoRun,
  setAuthAutoRun,
  onGeneratePkce,
  onOpenAuthUrl,
  onCopy,
  onRunAuthToken,
}: CodeFlowPanelProps) {
  return (
    <article className="panel">
      <h2>Code Flow</h2>
      <p>Step through authorization and token exchange.</p>

      <div className="step-card">
        <div className="step-header">
          <span className="step-index">1</span>
          <h3>Configure Authorization Request</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Authorization Endpoint
              <input
                value={authForm.authorizationEndpoint}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    authorizationEndpoint: event.target.value,
                  }))}
                placeholder="https://issuer.example.com/oauth/authorize"
              />
            </label>
            <label className="field">
              Token Endpoint
              <input
                value={authForm.tokenEndpoint}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    tokenEndpoint: event.target.value,
                  }))}
                placeholder="https://issuer.example.com/oauth/token"
              />
            </label>
          </div>
          <div className="row">
            <label className="field">
              Client ID
              <input
                value={authForm.clientId}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    clientId: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Redirect URI
              <input
                value={authForm.redirectUri}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    redirectUri: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Response Type
              <select
                value={authForm.responseType}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    responseType: event.target.value,
                  }))}
              >
                <option value="code">code</option>
                <option value="code id_token">code id_token</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label className="field">
              Scope
              <input
                value={authForm.scope}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    scope: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Prompt
              <input
                value={authForm.prompt}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    prompt: event.target.value,
                  }))}
                placeholder="login consent"
              />
            </label>
          </div>
          <div className="row">
            <label className="field">
              State
              <input
                value={authForm.state}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    state: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Nonce
              <input
                value={authForm.nonce}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    nonce: event.target.value,
                  }))}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="step-card">
        <div className="step-header">
          <span className="step-index">2</span>
          <h3>PKCE & Authorization URL</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Code Verifier
              <input
                value={authForm.codeVerifier}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    codeVerifier: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Code Challenge
              <input
                value={authForm.codeChallenge}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    codeChallenge: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Challenge Method
              <select
                value={authForm.codeChallengeMethod}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    codeChallengeMethod: event.target.value,
                  }))}
              >
                <option value="S256">S256</option>
                <option value="plain">plain</option>
              </select>
            </label>
          </div>
          <div className="inline">
            <label className="switch">
              <input
                type="checkbox"
                checked={authForm.usePkce}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    usePkce: event.target.checked,
                  }))}
              />
              Use PKCE
            </label>
            <button className="ghost" type="button" onClick={onGeneratePkce}>
              Generate PKCE
            </button>
            <button
              className="ghost"
              type="button"
              onClick={onOpenAuthUrl}
              disabled={!authorizationUrl}
            >
              Open Auth URL
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => onCopy(authorizationUrl)}
            >
              Copy URL
            </button>
          </div>
          <div className="output">{authorizationUrl || ""}</div>
        </div>
      </div>

      <div className="step-card">
        <div className="step-header">
          <span className="step-index">3</span>
          <h3>Token Exchange</h3>
        </div>
        <div className="section">
          <div className="row">
            <label className="field">
              Authorization Code
              <input
                value={authForm.code}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))}
              />
            </label>
            <label className="field">
              Client Auth Method
              <select
                value={authForm.authMethod}
                onChange={(event) =>
                  setAuthForm((prev) => ({
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
            <label className="field">
              Client Secret
              <input
                value={authForm.clientSecret}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    clientSecret: event.target.value,
                  }))}
                disabled={authForm.authMethod === "none" || isPublicClient}
              />
            </label>
          </div>
          {authForm.authMethod === "private_key_jwt" && (
            <label className="field">
              Client Assertion (JWT)
              <textarea
                value={authForm.clientAssertion}
                onChange={(event) =>
                  setAuthForm((prev) => ({
                    ...prev,
                    clientAssertion: event.target.value,
                  }))}
              />
            </label>
          )}
          <div className="inline">
            <button className="primary" type="button" onClick={onRunAuthToken}>
              Execute Token Request
            </button>
            <label className="switch">
              <input
                type="checkbox"
                checked={authAutoRun}
                onChange={(event) => setAuthAutoRun(event.target.checked)}
              />
              Auto execute
            </label>
            <button
              className="ghost"
              type="button"
              onClick={() => onCopy(authCurl)}
            >
              Copy curl
            </button>
          </div>
          <div className="output">{authTokenPayload.toString()}</div>
          <div className="output">{authCurl}</div>
        </div>
      </div>
    </article>
  );
}
