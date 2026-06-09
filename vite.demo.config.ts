import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/cool-globe/",
  plugins: [react()],
  build: {
    outDir: "dist-demo",
    emptyOutDir: true,
  },
});
