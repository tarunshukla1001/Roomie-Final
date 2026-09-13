import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 3000,
    host: "0.0.0.0",

    proxy: {
      "/api": {
        target: "https://roomie-final-production-8f96.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});