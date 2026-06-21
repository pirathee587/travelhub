import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      // Each role keeps its own original "@/..." import style,
      // just renamed to a role-specific alias so the three apps
      // (originally separate projects) don't collide when merged.
      "@tourist": path.resolve(__dirname, "./src/tourist"),
      "@agent": path.resolve(__dirname, "./src/agent"),
      "@admin": path.resolve(__dirname, "./src/admin"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src/shared"),
    },
  },
}));
