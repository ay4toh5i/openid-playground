import { createRoute } from "honox/factory";
import ClientCredentialsFlow from "../../islands/ClientCredentialsFlow";

export default createRoute((c) => {
  return c.render(<ClientCredentialsFlow currentPath="/flows/client-credentials" />);
});
