import { http, HttpResponse } from "msw";
import type { Task } from "../types/task";

// Mock 데이터
const tasks: Task[] = [
  {
    id: "1",
    title: "홈페이지 화면 구현",
    type: "CODE",
    typeNumber: 1,
    status: "TODO",
    priority: 8,
  },
  {
    id: "2",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "TODO",
    priority: 8,
  },
  {
    id: "3",
    title: "홈페이지 화면 구현",
    type: "CODE",
    typeNumber: 1,
    status: "IN_PROGRESS",
    priority: 8,
  },
  {
    id: "4",
    title: "홈페이지 화면 구현",
    type: "CODE",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
  },
  {
    id: "5",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
  },
  {
    id: "6",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
  },
  {
    id: "7",
    title: "MCP 연동 완료",
    type: "CODE",
    typeNumber: 1,
    status: "DONE",
    priority: 8,
  },
  {
    id: "8",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "DONE",
    priority: 8,
  },
];

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ ok: true, time: new Date().toISOString() });
  }),

  // 태스크 목록 조회
  http.get("/api/tasks", () => {
    return HttpResponse.json(tasks);
  }),

  // 태스크 상태 업데이트 (드래그 앤 드롭)
  http.patch("/api/tasks/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<Task>;

    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...body };
    return HttpResponse.json(tasks[taskIndex]);
  }),
];
