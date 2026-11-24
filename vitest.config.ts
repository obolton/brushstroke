import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolves the `brushstroke/jsx-runtime` import source used by JSX in tests
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["**/__tests__/**"],
      reporter: ["text"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
