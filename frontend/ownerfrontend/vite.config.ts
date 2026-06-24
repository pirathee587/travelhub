import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 8082,
      strictPort: true,
    }
  }
});
