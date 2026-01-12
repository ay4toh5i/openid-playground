import type { FC } from "hono/jsx";

export const Layout: FC = ({ children }) => {
  return (
    <div>
      <header class="bg-blue-600 text-white p-4">
        <h1 class="text-3xl font-bold">My Hono App</h1>
      </header>
      <main class="p-4">{children}</main>
      <footer class="bg-gray-200 text-center p-4 mt-4">
        <p>&copy; 2024 My Hono App</p>
      </footer>
    </div>
  );
};
