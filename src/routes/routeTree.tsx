import { lazy, Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { RootLayout, NotFound } from "./root";

const HomePage = lazy(() => import("@/pages/home/HomePage"));
const DocumentPage = lazy(() => import("@/pages/document/DocumentPage"));
const ConfirmPage = lazy(() => import("@/pages/document/confirm/SettingPage1"));
const SettingPage2 = lazy(() => import("@/pages/document/confirm/SettingPage2"));
const ChatPage = lazy(() => import("@/pages/document/chat/ChatPage"));
const TaskPage = lazy(() => import("@/pages/task/TaskPage"));
const InsightPage = lazy(() => import("@/pages/insight/InsightPage"));

const ProjectSettingPage = lazy(
  () => import("@/pages/project-setting/ProjectSettingPage"),
);
const MyProjectsPage = lazy(() => import("@/pages/my-projects/MyProjectsPage"));
const McpPage = lazy(() => import("@/pages/mcp/McpPage"));
const GuidePage = lazy(() => import("@/pages/guide/GuidePage"));
const AccountPage = lazy(() => import("@/pages/account/AccountPage"));


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

const documentConfirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/confirm",
  validateSearch: (search: Record<string, unknown>): {
    initialMessage?: string;
  } => ({
    initialMessage: search.initialMessage
      ? (search.initialMessage as string)
      : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <ConfirmPage />
    </Suspense>
  ),
});

const documentSetting2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/setting2",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <SettingPage2 />
    </Suspense>
  ),
});

const documentChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/chat",
  validateSearch: (search: Record<string, unknown>) => ({
    initialMessage: (search.initialMessage as string) || undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <ChatPage />
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

const insightRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insight",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <InsightPage />

    </Suspense>
  ),
});

const projectSettingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project-setting",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <ProjectSettingPage />
    </Suspense>
  ),
});

const myProjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-projects",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <MyProjectsPage />
    </Suspense>
  ),
});

const mcpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mcp",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <McpPage />
    </Suspense>
  ),
});

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guide",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <GuidePage />
    </Suspense>
  ),
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <AccountPage />

    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  documentRoute,
  documentConfirmRoute,
  documentSetting2Route,
  documentChatRoute,
  taskRoute,
  insightRoute,
  projectSettingRoute,
  myProjectsRoute,
  mcpRoute,
  guideRoute,
  accountRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
