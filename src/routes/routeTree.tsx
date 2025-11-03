import { lazy, Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { RootLayout, NotFound } from "./root";

const HomePage = lazy(() => import("@/pages/home/HomePage"));
const DocumentPage = lazy(() => import("@/pages/document/DocumentPage"));
const TaskPage = lazy(() => import("@/pages/task/TaskPage"));
const InsightPage = lazy(() => import("@/pages/insight/InsightPage"));

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <HomePage />
    </Suspense>
  ),
});

const documentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <DocumentPage />
    </Suspense>
  ),
});

const taskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/task",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <TaskPage />
    </Suspense>
  ),
});

const completeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insight",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <InsightPage />
    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  documentRoute,
  taskRoute,
  completeRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
