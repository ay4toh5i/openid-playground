import { useEffect, useMemo, useState } from "react";
import type {
  Client,
  ClientAuthMethod,
  FlowId,
  RequestResult,
} from "../lib/flowTypes.ts";
import { defaultClient, storageKey } from "../lib/flowTypes.ts";
import type {
  AuthForm,
  ClientCredentialsForm,
  LogoutForm,
  RefreshForm,
  RevokeForm,
  UserinfoForm,
} from "../lib/formTypes.ts";
import {
  buildPkceChallenge,
  decodeJwt,
  encodeBasicAuth,
  executeRequest,
  normalizeAuthMethod,
  randomId,
  randomVerifier,
  safeJsonParse,
} from "../lib/utils.ts";
import Topbar from "../components/Topbar.tsx";
import Sidebar from "../components/Sidebar.tsx";
import ClientModal from "../components/ClientModal.tsx";
import RightRail from "../components/RightRail.tsx";
import CodeFlowPanel from "../components/flows/CodeFlowPanel.tsx";
import ClientCredentialsPanel from "../components/flows/ClientCredentialsPanel.tsx";
import RefreshPanel from "../components/flows/RefreshPanel.tsx";
import UserinfoPanel from "../components/flows/UserinfoPanel.tsx";
import LogoutPanel from "../components/flows/LogoutPanel.tsx";
import RevokePanel from "../components/flows/RevokePanel.tsx";

export default function OAuthPlayground() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Client>(defaultClient);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowId>("code");

  const [authForm, setAuthForm] = useState<AuthForm>({
    authorizationEndpoint: "",
    tokenEndpoint: "",
    clientId: "",
    redirectUri: "",
    scope: "openid profile email",
    responseType: "code",
    state: "",
    nonce: "",
    prompt: "",
    usePkce: true,
    codeVerifier: "",
    codeChallenge: "",
    codeChallengeMethod: "S256",
    code: "",
    clientSecret: "",
    authMethod: "client_secret_basic",
    clientAssertion: "",
  });
  const [authTokenResult, setAuthTokenResult] = useState<RequestResult | null>(
    null,
  );
  const [authAutoRun, setAuthAutoRun] = useState(false);

  const [ccForm, setCcForm] = useState<ClientCredentialsForm>({
    tokenEndpoint: "",
    scope: "",
    audience: "",
    clientId: "",
    clientSecret: "",
    authMethod: "client_secret_basic",
    clientAssertion: "",
  });
  const [ccResult, setCcResult] = useState<RequestResult | null>(null);
  const [ccAutoRun, setCcAutoRun] = useState(false);

  const [refreshForm, setRefreshForm] = useState<RefreshForm>({
    tokenEndpoint: "",
    refreshToken: "",
    clientId: "",
    clientSecret: "",
    authMethod: "client_secret_basic",
    clientAssertion: "",
  });
  const [refreshResult, setRefreshResult] = useState<RequestResult | null>(
    null,
  );
  const [refreshAutoRun, setRefreshAutoRun] = useState(false);

  const [userinfoForm, setUserinfoForm] = useState<UserinfoForm>({
    userinfoEndpoint: "",
    accessToken: "",
  });
  const [userinfoResult, setUserinfoResult] = useState<RequestResult | null>(
    null,
  );
  const [userinfoAutoRun, setUserinfoAutoRun] = useState(false);

  const [logoutForm, setLogoutForm] = useState<LogoutForm>({
    endSessionEndpoint: "",
    idTokenHint: "",
    postLogoutRedirectUri: "",
    state: "",
  });

  const [revokeForm, setRevokeForm] = useState<RevokeForm>({
    revokeEndpoint: "",
    token: "",
    tokenTypeHint: "",
    clientId: "",
    clientSecret: "",
    authMethod: "client_secret_basic",
    clientAssertion: "",
  });
  const [revokeResult, setRevokeResult] = useState<RequestResult | null>(null);
  const [revokeAutoRun, setRevokeAutoRun] = useState(false);

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId) ?? null,
    [clients, activeClientId],
  );

  const isPublicClient = activeClient?.kind === "public";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = safeJsonParse(stored);
      if (Array.isArray(parsed)) {
        setClients(parsed as Client[]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(clients));
  }, [clients, loaded]);

  useEffect(() => {
    if (!activeClient && clients.length > 0) {
      setActiveClientId(clients[0].id);
    }
  }, [clients, activeClient]);

  useEffect(() => {
    if (!activeClient) return;
    const normalizedMethod = normalizeAuthMethod(
      activeClient.kind,
      activeClient.authMethod,
    );
    setAuthForm((prev) => ({
      ...prev,
      clientId: prev.clientId || activeClient.clientId,
      redirectUri: prev.redirectUri || activeClient.redirectUri,
      clientSecret: prev.clientSecret || activeClient.clientSecret,
      authMethod: normalizedMethod,
    }));
    setCcForm((prev) => ({
      ...prev,
      clientId: prev.clientId || activeClient.clientId,
      clientSecret: prev.clientSecret || activeClient.clientSecret,
      authMethod: normalizedMethod,
    }));
    setRefreshForm((prev) => ({
      ...prev,
      clientId: prev.clientId || activeClient.clientId,
      clientSecret: prev.clientSecret || activeClient.clientSecret,
      authMethod: normalizedMethod,
    }));
    setRevokeForm((prev) => ({
      ...prev,
      clientId: prev.clientId || activeClient.clientId,
      clientSecret: prev.clientSecret || activeClient.clientSecret,
      authMethod: normalizedMethod,
    }));
  }, [activeClient]);

  useEffect(() => {
    if (!authAutoRun) return;
    if (!authForm.tokenEndpoint || !authForm.code) return;
    const timer = setTimeout(() => {
      void runAuthToken();
    }, 600);
    return () => clearTimeout(timer);
  }, [authAutoRun, authForm]);

  useEffect(() => {
    if (!ccAutoRun) return;
    if (!ccForm.tokenEndpoint) return;
    const timer = setTimeout(() => {
      void runClientCredentials();
    }, 600);
    return () => clearTimeout(timer);
  }, [ccAutoRun, ccForm]);

  useEffect(() => {
    if (!refreshAutoRun) return;
    if (!refreshForm.tokenEndpoint || !refreshForm.refreshToken) return;
    const timer = setTimeout(() => {
      void runRefreshToken();
    }, 600);
    return () => clearTimeout(timer);
  }, [refreshAutoRun, refreshForm]);

  useEffect(() => {
    if (!userinfoAutoRun) return;
    if (!userinfoForm.userinfoEndpoint || !userinfoForm.accessToken) return;
    const timer = setTimeout(() => {
      void runUserinfo();
    }, 600);
    return () => clearTimeout(timer);
  }, [userinfoAutoRun, userinfoForm]);

  useEffect(() => {
    if (!revokeAutoRun) return;
    if (!revokeForm.revokeEndpoint || !revokeForm.token) return;
    const timer = setTimeout(() => {
      void runRevoke();
    }, 600);
    return () => clearTimeout(timer);
  }, [revokeAutoRun, revokeForm]);

  const authorizationUrl = useMemo(() => {
    if (!authForm.authorizationEndpoint) return "";
    try {
      const url = new URL(authForm.authorizationEndpoint);
      const params: Record<string, string> = {
        response_type: authForm.responseType,
        client_id: authForm.clientId,
        redirect_uri: authForm.redirectUri,
        scope: authForm.scope,
        state: authForm.state,
        nonce: authForm.nonce,
        prompt: authForm.prompt,
        code_challenge: authForm.usePkce ? authForm.codeChallenge : "",
        code_challenge_method: authForm.usePkce
          ? authForm.codeChallengeMethod
          : "",
      };
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
      return url.toString();
    } catch {
      return "Invalid authorization endpoint";
    }
  }, [authForm]);

  const logoutUrl = useMemo(() => {
    if (!logoutForm.endSessionEndpoint) return "";
    try {
      const url = new URL(logoutForm.endSessionEndpoint);
      const params: Record<string, string> = {
        id_token_hint: logoutForm.idTokenHint,
        post_logout_redirect_uri: logoutForm.postLogoutRedirectUri,
        state: logoutForm.state,
      };
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
      return url.toString();
    } catch {
      return "Invalid end session endpoint";
    }
  }, [logoutForm]);

  const authTokenPayload = useMemo(() => {
    const params: Record<string, string> = {
      grant_type: "authorization_code",
      code: authForm.code,
      redirect_uri: authForm.redirectUri,
      code_verifier: authForm.usePkce ? authForm.codeVerifier : "",
    };
    if (authForm.authMethod !== "client_secret_basic") {
      params.client_id = authForm.clientId;
    }
    if (authForm.authMethod === "client_secret_post") {
      params.client_secret = authForm.clientSecret;
    }
    if (authForm.authMethod === "private_key_jwt") {
      params.client_id = authForm.clientId;
      params.client_assertion_type =
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
      params.client_assertion = authForm.clientAssertion;
    }
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return new URLSearchParams(params);
  }, [authForm]);

  const ccPayload = useMemo(() => {
    const params: Record<string, string> = {
      grant_type: "client_credentials",
      scope: ccForm.scope,
      audience: ccForm.audience,
    };
    if (ccForm.authMethod !== "client_secret_basic") {
      params.client_id = ccForm.clientId;
    }
    if (ccForm.authMethod === "client_secret_post") {
      params.client_secret = ccForm.clientSecret;
    }
    if (ccForm.authMethod === "private_key_jwt") {
      params.client_id = ccForm.clientId;
      params.client_assertion_type =
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
      params.client_assertion = ccForm.clientAssertion;
    }
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return new URLSearchParams(params);
  }, [ccForm]);

  const refreshPayload = useMemo(() => {
    const params: Record<string, string> = {
      grant_type: "refresh_token",
      refresh_token: refreshForm.refreshToken,
    };
    if (refreshForm.authMethod !== "client_secret_basic") {
      params.client_id = refreshForm.clientId;
    }
    if (refreshForm.authMethod === "client_secret_post") {
      params.client_secret = refreshForm.clientSecret;
    }
    if (refreshForm.authMethod === "private_key_jwt") {
      params.client_id = refreshForm.clientId;
      params.client_assertion_type =
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
      params.client_assertion = refreshForm.clientAssertion;
    }
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return new URLSearchParams(params);
  }, [refreshForm]);

  const revokePayload = useMemo(() => {
    const params: Record<string, string> = {
      token: revokeForm.token,
      token_type_hint: revokeForm.tokenTypeHint,
    };
    if (revokeForm.authMethod !== "client_secret_basic") {
      params.client_id = revokeForm.clientId;
    }
    if (revokeForm.authMethod === "client_secret_post") {
      params.client_secret = revokeForm.clientSecret;
    }
    if (revokeForm.authMethod === "private_key_jwt") {
      params.client_id = revokeForm.clientId;
      params.client_assertion_type =
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
      params.client_assertion = revokeForm.clientAssertion;
    }
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    return new URLSearchParams(params);
  }, [revokeForm]);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "content-type": "application/x-www-form-urlencoded",
    };
    if (authForm.authMethod === "client_secret_basic") {
      if (authForm.clientId && authForm.clientSecret) {
        headers.authorization = "Basic " +
          encodeBasicAuth(authForm.clientId, authForm.clientSecret);
      }
    }
    return headers;
  }, [authForm]);

  const ccHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "content-type": "application/x-www-form-urlencoded",
    };
    if (ccForm.authMethod === "client_secret_basic") {
      if (ccForm.clientId && ccForm.clientSecret) {
        headers.authorization = "Basic " +
          encodeBasicAuth(ccForm.clientId, ccForm.clientSecret);
      }
    }
    return headers;
  }, [ccForm]);

  const refreshHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "content-type": "application/x-www-form-urlencoded",
    };
    if (refreshForm.authMethod === "client_secret_basic") {
      if (refreshForm.clientId && refreshForm.clientSecret) {
        headers.authorization = "Basic " +
          encodeBasicAuth(refreshForm.clientId, refreshForm.clientSecret);
      }
    }
    return headers;
  }, [refreshForm]);

  const revokeHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      "content-type": "application/x-www-form-urlencoded",
    };
    if (revokeForm.authMethod === "client_secret_basic") {
      if (revokeForm.clientId && revokeForm.clientSecret) {
        headers.authorization = "Basic " +
          encodeBasicAuth(revokeForm.clientId, revokeForm.clientSecret);
      }
    }
    return headers;
  }, [revokeForm]);

  const userinfoHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (userinfoForm.accessToken) {
      headers.authorization = `Bearer ${userinfoForm.accessToken}`;
    }
    return headers;
  }, [userinfoForm]);

  const authCurl = useMemo(() => {
    if (!authForm.tokenEndpoint) return "";
    const headerLines = Object.entries(authHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(" ");
    return `curl -X POST ${authForm.tokenEndpoint} ${headerLines} -d "${authTokenPayload.toString()}"`;
  }, [authHeaders, authForm.tokenEndpoint, authTokenPayload]);

  const ccCurl = useMemo(() => {
    if (!ccForm.tokenEndpoint) return "";
    const headerLines = Object.entries(ccHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(" ");
    return `curl -X POST ${ccForm.tokenEndpoint} ${headerLines} -d "${ccPayload.toString()}"`;
  }, [ccHeaders, ccForm.tokenEndpoint, ccPayload]);

  const refreshCurl = useMemo(() => {
    if (!refreshForm.tokenEndpoint) return "";
    const headerLines = Object.entries(refreshHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(" ");
    return `curl -X POST ${refreshForm.tokenEndpoint} ${headerLines} -d "${refreshPayload.toString()}"`;
  }, [refreshHeaders, refreshForm.tokenEndpoint, refreshPayload]);

  const userinfoCurl = useMemo(() => {
    if (!userinfoForm.userinfoEndpoint) return "";
    const headerLines = Object.entries(userinfoHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(" ");
    return `curl ${headerLines} ${userinfoForm.userinfoEndpoint}`;
  }, [userinfoForm.userinfoEndpoint, userinfoHeaders]);

  const revokeCurl = useMemo(() => {
    if (!revokeForm.revokeEndpoint) return "";
    const headerLines = Object.entries(revokeHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(" ");
    return `curl -X POST ${revokeForm.revokeEndpoint} ${headerLines} -d "${revokePayload.toString()}"`;
  }, [revokeHeaders, revokeForm.revokeEndpoint, revokePayload]);

  const tokenData = useMemo(() => {
    const primary = authTokenResult?.body
      ? safeJsonParse(authTokenResult.body)
      : null;
    if (primary) return primary;
    const fallback = ccResult?.body ? safeJsonParse(ccResult.body) : null;
    if (fallback) return fallback;
    return null;
  }, [authTokenResult, ccResult]);

  const accessToken = tokenData?.access_token as string | undefined;
  const idToken = tokenData?.id_token as string | undefined;
  const refreshToken = tokenData?.refresh_token as string | undefined;

  const decodedAccess = useMemo(() => decodeJwt(accessToken), [accessToken]);
  const decodedId = useMemo(() => decodeJwt(idToken), [idToken]);

  function missingResult(message: string): RequestResult {
    return { ok: false, status: 0, headers: {}, body: "", error: message };
  }

  function resultToText(result: RequestResult | null, fallback: string) {
    if (!result) return fallback;
    if (result.body) return result.body;
    if (result.error) return `Error: ${result.error}`;
    return fallback;
  }

  async function generatePkce() {
    const verifier = randomVerifier(64);
    const challenge = await buildPkceChallenge(verifier);
    setAuthForm((prev) => ({
      ...prev,
      codeVerifier: verifier,
      codeChallenge: challenge,
      codeChallengeMethod: "S256",
      usePkce: true,
    }));
  }

  async function runAuthToken() {
    if (!authForm.tokenEndpoint) {
      setAuthTokenResult(
        missingResult("Token endpoint is required for token exchange."),
      );
      return;
    }
    const result = await executeRequest(
      authForm.tokenEndpoint,
      "POST",
      authHeaders,
      authTokenPayload,
    );
    setAuthTokenResult(result);
  }

  async function runClientCredentials() {
    if (!ccForm.tokenEndpoint) {
      setCcResult(
        missingResult("Token endpoint is required for client credentials."),
      );
      return;
    }
    const result = await executeRequest(
      ccForm.tokenEndpoint,
      "POST",
      ccHeaders,
      ccPayload,
    );
    setCcResult(result);
  }

  async function runRefreshToken() {
    if (!refreshForm.tokenEndpoint) {
      setRefreshResult(
        missingResult("Token endpoint is required for refresh token."),
      );
      return;
    }
    if (!refreshForm.refreshToken) {
      setRefreshResult(missingResult("Refresh token is required."));
      return;
    }
    const result = await executeRequest(
      refreshForm.tokenEndpoint,
      "POST",
      refreshHeaders,
      refreshPayload,
    );
    setRefreshResult(result);
  }

  async function runUserinfo() {
    if (!userinfoForm.userinfoEndpoint) {
      setUserinfoResult(missingResult("Userinfo endpoint is required."));
      return;
    }
    if (!userinfoForm.accessToken) {
      setUserinfoResult(
        missingResult("Access token is required for userinfo."),
      );
      return;
    }
    const result = await executeRequest(
      userinfoForm.userinfoEndpoint,
      "GET",
      userinfoHeaders,
    );
    setUserinfoResult(result);
  }

  async function runRevoke() {
    if (!revokeForm.revokeEndpoint) {
      setRevokeResult(missingResult("Revocation endpoint is required."));
      return;
    }
    if (!revokeForm.token) {
      setRevokeResult(missingResult("Token is required for revocation."));
      return;
    }
    const result = await executeRequest(
      revokeForm.revokeEndpoint,
      "POST",
      revokeHeaders,
      revokePayload,
    );
    setRevokeResult(result);
  }

  function saveClient() {
    if (!draft.name || !draft.clientId) return;
    const id = draft.id || randomId();
    const authMethod = normalizeAuthMethod(draft.kind, draft.authMethod);
    const payload = { ...draft, id, authMethod };
    if (payload.kind === "public") {
      payload.clientSecret = "";
    }
    setClients((prev) => {
      const exists = prev.find((client) => client.id === id);
      if (exists) {
        return prev.map((client) => (client.id === id ? payload : client));
      }
      return [payload, ...prev];
    });
    setDraft({ ...defaultClient });
    setActiveClientId(id);
    setModalOpen(false);
  }

  function editClient(client: Client) {
    setDraft(client);
    setModalOpen(true);
  }

  function deleteClient(id: string) {
    setClients((prev) => prev.filter((client) => client.id !== id));
    if (activeClientId === id) {
      setActiveClientId("");
    }
  }

  function exportClients() {
    const blob = new Blob([JSON.stringify(clients, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oidc-clients.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importClients(file: File | null) {
    if (!file) return;
    const text = await file.text();
    const parsed = safeJsonParse(text);
    if (Array.isArray(parsed)) {
      setClients(parsed as Client[]);
      setActiveClientId(parsed[0]?.id ?? "");
    }
  }

  async function copyText(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  const stepResults = useMemo(() => {
    switch (activeFlow) {
      case "code":
        return [
          authorizationUrl || "No auth URL yet.",
          authTokenPayload.toString(),
          resultToText(authTokenResult, "Run token exchange."),
        ];
      case "client_credentials":
        return [
          ccPayload.toString(),
          resultToText(ccResult, "Run client credentials."),
        ];
      case "refresh":
        return [
          refreshPayload.toString(),
          resultToText(refreshResult, "Run refresh flow."),
        ];
      case "userinfo":
        return [resultToText(userinfoResult, "Run userinfo.")];
      case "logout":
        return [logoutUrl || "Generate logout URL."];
      case "revoke":
        return [resultToText(revokeResult, "Run revoke.")];
      default:
        return ["Select a flow."];
    }
  }, [
    activeFlow,
    authorizationUrl,
    authTokenPayload,
    authTokenResult,
    ccPayload,
    ccResult,
    refreshPayload,
    refreshResult,
    userinfoResult,
    logoutUrl,
    revokeResult,
  ]);

  return (
    <div>
      <Topbar onOpenModal={() => setModalOpen(true)} onExport={exportClients} />

      <div className="app-shell">
        <Sidebar
          activeFlow={activeFlow}
          onFlowChange={setActiveFlow}
          clients={clients}
          onUseClient={setActiveClientId}
          onEditClient={editClient}
          onDeleteClient={deleteClient}
          onImportClients={importClients}
        />

        <section className="section">
          {activeFlow === "code" && (
            <CodeFlowPanel
              authForm={authForm}
              setAuthForm={setAuthForm}
              isPublicClient={!!isPublicClient}
              authorizationUrl={authorizationUrl}
              authTokenPayload={authTokenPayload}
              authCurl={authCurl}
              authAutoRun={authAutoRun}
              setAuthAutoRun={setAuthAutoRun}
              onGeneratePkce={generatePkce}
              onOpenAuthUrl={() => window.open(authorizationUrl, "_blank")}
              onCopy={copyText}
              onRunAuthToken={runAuthToken}
            />
          )}

          {activeFlow === "client_credentials" && (
            <ClientCredentialsPanel
              form={ccForm}
              setForm={setCcForm}
              isPublicClient={!!isPublicClient}
              payload={ccPayload}
              curl={ccCurl}
              autoRun={ccAutoRun}
              setAutoRun={setCcAutoRun}
              onRun={runClientCredentials}
              onCopy={copyText}
            />
          )}

          {activeFlow === "refresh" && (
            <RefreshPanel
              form={refreshForm}
              setForm={setRefreshForm}
              isPublicClient={!!isPublicClient}
              payload={refreshPayload}
              curl={refreshCurl}
              autoRun={refreshAutoRun}
              setAutoRun={setRefreshAutoRun}
              onRun={runRefreshToken}
              onCopy={copyText}
              refreshTokenHint={refreshToken}
            />
          )}

          {activeFlow === "userinfo" && (
            <UserinfoPanel
              form={userinfoForm}
              setForm={setUserinfoForm}
              curl={userinfoCurl}
              autoRun={userinfoAutoRun}
              setAutoRun={setUserinfoAutoRun}
              onRun={runUserinfo}
              onCopy={copyText}
              accessTokenHint={accessToken}
            />
          )}

          {activeFlow === "logout" && (
            <LogoutPanel
              form={logoutForm}
              setForm={setLogoutForm}
              logoutUrl={logoutUrl}
              onOpen={() => window.open(logoutUrl, "_blank")}
              onCopy={copyText}
              idTokenHint={idToken}
            />
          )}

          {activeFlow === "revoke" && (
            <RevokePanel
              form={revokeForm}
              setForm={setRevokeForm}
              isPublicClient={!!isPublicClient}
              payload={revokePayload}
              curl={revokeCurl}
              autoRun={revokeAutoRun}
              setAutoRun={setRevokeAutoRun}
              onRun={runRevoke}
              onCopy={copyText}
            />
          )}
        </section>

        <RightRail
          activeFlow={activeFlow}
          accessToken={accessToken}
          idToken={idToken}
          decodedAccess={decodedAccess}
          decodedId={decodedId}
          refreshToken={refreshToken}
          stepResults={stepResults}
          onCopy={copyText}
        />
      </div>

      <ClientModal
        open={modalOpen}
        draft={draft}
        setDraft={setDraft}
        onSave={saveClient}
        onClose={() => setModalOpen(false)}
      />

      <div className="footer">
        Honox + React renderer. Client data is stored locally in your browser.
      </div>
    </div>
  );
}
