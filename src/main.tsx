import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes/routeTree";
import "./index.css";

const queryClient = new QueryClient();

async function enableMocking() {
  // 프로덕션에서도 MSW 사용 (백엔드 연결 전까지)
  const { worker } = await import("./mocks/browser");
  await worker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass", // 처리되지 않은 요청은 그대로 통과
  });
  console.log("[MSW] started");
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
