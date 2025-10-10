import { lazy, Suspense } from "react";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout, NotFound } from "./root";

const HomePage = lazy(() => import("@/pages/home/HomePage"));

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<div className="p-6">로딩중...</div>}>
      <HomePage />
    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([homeRoute]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
