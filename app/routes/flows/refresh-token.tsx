import { createRoute } from "honox/factory";
import RefreshTokenFlow from "../../islands/refresh-token-flow";

export default createRoute((c) => {
  return c.render(<RefreshTokenFlow />, { title: "Refresh Token Flow - OAuth/OIDC Playground" });
});
