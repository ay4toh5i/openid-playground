import type { Client, ClientAuthMethod, ClientKind } from "../lib/flowTypes.ts";
import { clientAuthOptions, defaultClient } from "../lib/flowTypes.ts";
import { normalizeAuthMethod } from "../lib/utils.ts";

export type ClientModalProps = {
  open: boolean;
  draft: Client;
  setDraft: (client: Client) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function ClientModal({
  open,
  draft,
  setDraft,
  onSave,
  onClose,
}: ClientModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Register Client</h3>
          <button className="ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="section">
          <label className="field">
            Client Name
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })}
            />
          </label>
          <label className="field">
            Client ID
            <input
              value={draft.clientId}
              onChange={(event) =>
                setDraft({ ...draft, clientId: event.target.value })}
            />
          </label>
          <label className="field">
            Client Secret
            <input
              value={draft.clientSecret}
              onChange={(event) =>
                setDraft({ ...draft, clientSecret: event.target.value })}
              disabled={draft.kind === "public"}
            />
          </label>
          <label className="field">
            Redirect URI
            <input
              value={draft.redirectUri}
              onChange={(event) =>
                setDraft({ ...draft, redirectUri: event.target.value })}
            />
          </label>
          <label className="field">
            Client Type
            <select
              value={draft.kind}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  kind: event.target.value as ClientKind,
                  authMethod: normalizeAuthMethod(
                    event.target.value as ClientKind,
                    draft.authMethod,
                  ),
                })}
            >
              <option value="confidential">confidential</option>
              <option value="public">public</option>
            </select>
          </label>
          <label className="field">
            Auth Method
            <select
              value={draft.authMethod}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  authMethod: normalizeAuthMethod(
                    draft.kind,
                    event.target.value as ClientAuthMethod,
                  ),
                })}
              disabled={draft.kind === "public"}
            >
              {clientAuthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="inline">
            <button className="primary" type="button" onClick={onSave}>
              Save Client
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => setDraft({ ...defaultClient })}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
