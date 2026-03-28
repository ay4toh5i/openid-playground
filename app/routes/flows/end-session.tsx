import { createRoute } from "honox/factory";
import EndSessionFlow from "../../islands/end-session-flow";

export default createRoute((c) => {
  return c.render(<EndSessionFlow />, {
    title: "RP-Initiated Logout - OAuth/OIDC Playground",
  });
});
