import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://34.61.144.150:8000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost", // 쿠키 도메인을 localhost로 재작성
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // 쿠키를 자동으로 전달하도록 설정
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
    },
  },
});
