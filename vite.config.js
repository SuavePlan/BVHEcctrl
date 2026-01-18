import * as path from "node:path";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const isCodeSandbox = "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;

const dev = defineConfig({
  plugins: [react()],
  root: "example/",
  publicDir: "../public/",
  base: "./",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
});

const build = defineConfig({
  publicDir: false,
  plugins: [
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    minify: "esbuild",
    outDir: "dist",
    sourcemap: true,
    target: "es2018",
    lib: {
      formats: ["cjs", "es"],
      entry: "src/index.ts",
      fileName: "[name]",
    },
    rollupOptions: {
      external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
      output: {
        sourcemapExcludeSources: true,
        preserveModules: false,
      },
    },
  },
});

export default process.argv[2] ? build : dev;
