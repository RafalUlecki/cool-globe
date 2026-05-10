import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  define:
    command === "build"
      ? { "process.env.NODE_ENV": JSON.stringify("production") }
      : undefined,
  build: {
    copyPublicDir: false,
    lib: {
      entry: "src/index.ts",
      name: "CoolGlobe",
      fileName: "cool-globe",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-globe.gl",
        "three",
      ],
    },
  },
}));
