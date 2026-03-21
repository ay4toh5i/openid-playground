import { createRoute } from "honox/factory";
import AuthCodeFlow from "../../islands/AuthCodeFlow";

export default createRoute((c) => {
  return c.render(<AuthCodeFlow currentPath="/flows/authorization-code" />);
});
