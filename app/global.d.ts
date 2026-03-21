import type {} from "hono";
import type {} from "@hono/react-renderer";

declare module "hono" {
  interface Env {
    Variables: {};
    Bindings: {};
  }
}

declare module "@hono/react-renderer" {
  interface Props {
    title?: string;
  }
}
