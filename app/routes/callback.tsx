import { createRoute } from "honox/factory";

const script = `(function(){
  try {
    var p = new URLSearchParams(location.search);
    var h = new URLSearchParams(location.hash.slice(1));
    if (window.opener) {
      window.opener.postMessage({
        type: 'oauth_callback',
        code: p.get('code') || h.get('code') || undefined,
        state: p.get('state') || h.get('state') || undefined,
        error: p.get('error') || h.get('error') || undefined,
        error_description: p.get('error_description') || h.get('error_description') || undefined,
      }, location.origin);
      setTimeout(function(){ window.close(); }, 300);
    }
  } catch(e) {}
})();`;

export default createRoute((c) => {
  return c.html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>OAuth Callback</title></head>` +
      `<body><script>${script}</script>` +
      `<p style="font-family:system-ui;text-align:center;margin-top:20vh">Processing authorization... This window should close automatically.</p>` +
      `</body></html>`,
  );
});
