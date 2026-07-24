import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/complex-formulation-ai-hub/",
  server: {
    port: 3000,
  },
});
