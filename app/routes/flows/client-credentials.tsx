import { createRoute } from "honox/factory";
import ClientCredentialsFlow from "../../islands/client-credentials-flow";

export default createRoute((c) => {
  return c.render(<ClientCredentialsFlow />, { title: "Client Credentials Flow - OAuth/OIDC Playground" });
});
