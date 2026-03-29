import { createRoute } from "honox/factory";

export default createRoute((c) => {
  return c.render(
    <script
      dangerouslySetInnerHTML={{
        __html: `var f=localStorage.getItem('oidc-playground-last-flow')||'authorization-code';location.replace('/flows/'+f);`,
      }}
    />,
    { title: "OAuth/OIDC Playground" },
  );
});
