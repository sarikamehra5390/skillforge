import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      historyApiFallback: true,
    },
    preview: {
      host: true,
      port: 5173,
      historyApiFallback: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
