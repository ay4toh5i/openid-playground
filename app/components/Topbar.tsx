export type TopbarProps = {
  onOpenModal: () => void;
  onExport: () => void;
};

export default function Topbar({ onOpenModal, onExport }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        OAuth Tools
      </div>
      <div className="top-links">
        <span>OAuth 2.1</span>
        <span>OIDC Core</span>
        <span>Playground</span>
      </div>
      <div className="top-actions">
        <button className="ghost" type="button" onClick={onOpenModal}>
          Register client
        </button>
        <button className="ghost" type="button" onClick={onExport}>
          Export
        </button>
      </div>
    </div>
  );
}
