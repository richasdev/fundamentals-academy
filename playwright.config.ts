import { defineConfig } from "@playwright/test";
const port = Number(process.env.PLAYWRIGHT_PORT || 5173);
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 60_000,
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
