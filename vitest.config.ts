import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 30000, // 30 seconds for YouTube API calls
    hookTimeout: 30000,
  },
  esbuild: {
    target: "node18",
  },
});
