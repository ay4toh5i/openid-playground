import { createRoute } from "honox/factory";

export default createRoute((c) => {
  return c.html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>OAuth/OIDC Playground</title></head>` +
    `<body><script>` +
    `var f=localStorage.getItem('oidc-playground-last-flow')||'authorization-code';` +
    `location.replace('/flows/'+f);` +
    `<\/script></body></html>`
  );
});
