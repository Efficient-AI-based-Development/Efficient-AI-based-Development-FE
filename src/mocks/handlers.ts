import { http, HttpResponse } from "msw";
import type { Task } from "../types/task";
import { mockTasks } from "../pages/task/mocks/taskData";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ ok: true, time: new Date().toISOString() });
  }),

  // 태스크 목록 조회
  http.get("/api/tasks", () => {
    return HttpResponse.json(mockTasks);
  }),

  // 태스크 상태 업데이트 (드래그 앤 드롭)
  http.patch("/api/tasks/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<Task>;

    const taskIndex = mockTasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...body };
    return HttpResponse.json(mockTasks[taskIndex]);
  }),
];
