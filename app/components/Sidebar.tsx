import type { Client, FlowId } from "../lib/flowTypes.ts";
import { flowTabs } from "../lib/flowTypes.ts";

export type SidebarProps = {
  activeFlow: FlowId;
  onFlowChange: (flow: FlowId) => void;
  clients: Client[];
  onUseClient: (id: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onImportClients: (file: File | null) => void;
};

export default function Sidebar({
  activeFlow,
  onFlowChange,
  clients,
  onUseClient,
  onEditClient,
  onDeleteClient,
  onImportClients,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="nav-block">
        <div className="nav-title">Flows</div>
        <div className="nav-list">
          {flowTabs.map((flow) => (
            <button
              key={flow.id}
              className={`nav-item ${activeFlow === flow.id ? "active" : ""}`}
              type="button"
              onClick={() => onFlowChange(flow.id)}
            >
              <span>{flow.label}</span>
              {flow.pill && <span className="nav-pill">{flow.pill}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="nav-block">
        <div className="nav-title">Workspace</div>
        <div className="list">
          {clients.length === 0 && (
            <div className="list-item">Add a client to begin.</div>
          )}
          {clients.map((client) => (
            <div className="list-item" key={client.id}>
              <div className="inline">
                <strong>{client.name}</strong>
                <span className="badge">{client.kind}</span>
              </div>
              <div className="inline">
                <button
                  className="ghost"
                  type="button"
                  onClick={() => onUseClient(client.id)}
                >
                  Use
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => onEditClient(client)}
                >
                  Edit
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => onDeleteClient(client.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="section">
          <label className="button">
            Import
            <input
              type="file"
              accept="application/json"
              onChange={(event) =>
                onImportClients(event.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </section>
    </aside>
  );
}
