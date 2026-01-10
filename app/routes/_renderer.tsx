import { reactRenderer } from "@hono/react-renderer";
import { Script } from "honox/server";

const css = `
:root {
  color-scheme: dark;
  --bg: #15161b;
  --bg-2: #1c1e24;
  --panel: #242733;
  --panel-2: #2b2f3b;
  --panel-3: #1e212b;
  --text: #e6e7ea;
  --muted: #9aa0ab;
  --border: rgba(255, 255, 255, 0.08);
  --accent: #a0e77a;
  --accent-2: #6aa5ff;
  --accent-3: #f7b955;
  --danger: #f36c6c;
  --shadow: 0 24px 40px rgba(4, 5, 8, 0.45);
  --radius: 14px;
  --mono: "IBM Plex Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --display: "Space Grotesk", "Avenir Next", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--display);
  color: var(--text);
  background: radial-gradient(circle at 10% 20%, rgba(106, 165, 255, 0.15), transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(160, 231, 122, 0.12), transparent 35%),
    #111217;
}

a {
  color: inherit;
  text-decoration: none;
}

main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  background: linear-gradient(120deg, rgba(36, 39, 51, 0.9), rgba(21, 22, 27, 0.9));
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 5;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(140deg, #f472b6, #a855f7);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.6);
}

.top-links {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--muted);
}

.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button,
button {
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 8px 14px;
  background: var(--panel-2);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--display);
}

button.primary,
.button.primary {
  background: linear-gradient(135deg, #7ddc8b, #2dd4bf);
  color: #101216;
  border: none;
}

button.ghost {
  background: transparent;
}

.app-shell {
  flex: 1;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 18px;
  padding: 20px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-block {
  background: var(--panel-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  box-shadow: var(--shadow);
}

.nav-title {
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  font-size: 0.9rem;
  text-align: left;
}

.nav-item.active,
.nav-item:hover {
  border-color: var(--border);
  background: rgba(255, 255, 255, 0.05);
}

.nav-pill {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(106, 165, 255, 0.2);
  color: var(--accent-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
}

.panel h2,
.panel h3 {
  margin: 0 0 10px;
}

.panel p {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 0.9rem;
}

.section {
  display: grid;
  gap: 14px;
}

.section + .section {
  margin-top: 18px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.field input,
.field select,
.field textarea {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 10px 12px;
  font-size: 0.9rem;
  background: var(--panel-2);
  color: var(--text);
  font-family: var(--display);
}

.field textarea {
  min-height: 100px;
  font-family: var(--mono);
  resize: vertical;
}

.inline {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--muted);
}

.switch input {
  accent-color: var(--accent);
}

.output {
  background: #111317;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 12px;
  font-family: var(--mono);
  font-size: 0.82rem;
  color: #dce1e8;
  white-space: pre-wrap;
  word-break: break-word;
}

.badge {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(160, 231, 122, 0.14);
  color: var(--accent);
}

.list {
  display: grid;
  gap: 10px;
}

.list-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.token-panel {
  border-left: 4px solid var(--accent-2);
  background: var(--panel-2);
}

.token-panel.warn {
  border-left-color: var(--accent-3);
}

.token-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}

.token-content {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: #cdd3dd;
}

.step-card {
  background: var(--panel-2);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 16px;
  display: grid;
  gap: 12px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(160, 231, 122, 0.2);
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 11, 15, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal {
  width: min(540px, 92vw);
  background: var(--panel);
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 20px;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.footer {
  color: var(--muted);
  font-size: 0.8rem;
  padding: 18px 22px 24px;
}

@media (max-width: 1200px) {
  .app-shell {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .right-rail {
    display: none;
  }
}

@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }
}
`;

export default reactRenderer(({ children, title }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ?? "OIDC OAuth Playground"}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Script src="/app/client.ts" />
    </head>
    <body>
      <main>{children}</main>
    </body>
  </html>
));
