import { createRoute } from "honox/factory";
import AuthorizationCodeFlow from "../../islands/authorization-code-flow";

export default createRoute((c) => {
  return c.render(<AuthorizationCodeFlow />, { title: "Authorization Code Flow - OAuth/OIDC Playground" });
});
