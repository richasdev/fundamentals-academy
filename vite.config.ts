import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        "**/*.tsbuildinfo",
        "**/test-results/**",
        "**/e2e/**",
        "**/docs/**",
        "**/*.md",
        "**/playwright.config.ts",
        "**/vitest.config.ts",
      ],
    },
  },
});
