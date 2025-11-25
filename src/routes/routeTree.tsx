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
const SettingPage2 = lazy(
  () => import("@/pages/document/confirm/SettingPage2"),
);
const SettingPage3 = lazy(
  () => import("@/pages/document/confirm/SettingPage3"),
);
const CheckPage = lazy(() => import("@/pages/document/confirm/CheckPage"));
const TaskPage = lazy(() => import("@/pages/task/TaskPage"));
const InsightPage = lazy(() => import("@/pages/insight/InsightPage"));

const ProjectSettingPage = lazy(
  () => import("@/pages/project-setting/ProjectSettingPage"),
);
const MyProjectsPage = lazy(() => import("@/pages/my-projects/MyProjectsPage"));
const McpPage = lazy(() => import("@/pages/mcp/McpPage"));
const GuidePage = lazy(() => import("@/pages/guide/GuidePage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

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

const documentSetting1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/setting1",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
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
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    projectName?: string;
    mainColor?: string;
    pageCount?: string;
    featureCount?: string;
    aiModel?: string;
    techStack?: string;
  } => ({
    projectName: search.projectName as string | undefined,
    mainColor: search.mainColor as string | undefined,
    pageCount: search.pageCount as string | undefined,
    featureCount: search.featureCount as string | undefined,
    aiModel: search.aiModel as string | undefined,
    techStack: search.techStack as string | undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <SettingPage2 />
    </Suspense>
  ),
});

const documentSetting3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/setting3",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <SettingPage3 />
    </Suspense>
  ),
});

const documentCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document/check",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <CheckPage />
    </Suspense>
  ),
});

const taskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/task",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    projectId?: string;
    new?: string;
  } => ({
    projectId: search.projectId ? String(search.projectId) : undefined,
    new: search.new ? String(search.new) : undefined,
  }),
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <TaskPage />
    </Suspense>
  ),
});

const insightRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insight",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    projectId?: string;
  } => ({
    projectId: search.projectId ? String(search.projectId) : undefined,
  }),
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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<div className="p-6"> 로딩중...</div>}>
      <LoginPage />
    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  documentRoute,
  documentSetting1Route,
  documentSetting2Route,
  documentSetting3Route,
  documentCheckRoute,
  taskRoute,
  insightRoute,
  projectSettingRoute,
  myProjectsRoute,
  mcpRoute,
  guideRoute,
  loginRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
