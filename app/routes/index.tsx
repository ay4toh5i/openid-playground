import { createRoute } from "honox/factory";
import OAuthPlayground from "../islands/OAuthPlayground.tsx";

export default createRoute((c) => {
  return c.render(<OAuthPlayground />, { title: "OIDC OAuth Playground" });
});
