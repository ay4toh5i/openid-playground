import { createRoute } from "honox/factory";
import Playground from "../islands/playground";

export default createRoute((c) => {
  return c.render(<Playground />, { title: "OAuth/OIDC Playground" });
});
