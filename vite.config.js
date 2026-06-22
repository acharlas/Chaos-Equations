import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000,
    host: process.env.DOCKER ? true : false,
    watch: process.env.DOCKER ? { usePolling: true } : undefined,
  },
  plugins: [react()],
  base: "/Chaos-Equations",
});
