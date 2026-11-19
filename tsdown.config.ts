import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts", "src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
  platform: "neutral",
  dts: true,
  publint: true,
  attw: { profile: "esm-only" },
});
