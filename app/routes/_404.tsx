import type { NotFoundHandler } from "hono";

const handler: NotFoundHandler = (c) => {
  return c.render(
    <div className="panel">
      <h2>Not Found</h2>
      <p>That page does not exist. Head back to the toolkit.</p>
      <a className="button secondary" href="/">Go home</a>
    </div>,
  );
};

export default handler;
