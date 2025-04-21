import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig(({ mode }) => ({
  server: {
    host: 'localhost',
    port: 8081,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8081,
    },
  },
  plugins: [
    ...(mode === 'development' ? [react()] : [react()]),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
