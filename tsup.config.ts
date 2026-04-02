import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "api",
  external: ["pg-native"],
  banner: {
    js: "import{createRequire}from'module';const require=createRequire(import.meta.url);",
  },
});

