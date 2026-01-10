import type { ErrorHandler } from "hono";

const handler: ErrorHandler = (error, c) => {
  return c.render(
    <div className="panel">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <a className="button secondary" href="/">Return home</a>
    </div>,
  );
};

export default handler;
