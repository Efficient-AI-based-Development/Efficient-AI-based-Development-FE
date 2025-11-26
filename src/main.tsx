import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes/routeTree";
import "./index.css";

const queryClient = new QueryClient();

// MSW Service Worker 등록 해제
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      // mockServiceWorker 관련 Service Worker만 해제
      if (registration.scope.includes("mockServiceWorker")) {
        registration.unregister().then((success) => {
          if (success) {
            console.log("[MSW] Service Worker unregistered");
}
        });
      }
    }
  });
}

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
