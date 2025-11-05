import { http, HttpResponse } from "msw";
import type { Task } from "../types/task";
import { mockTasks } from "../pages/task/mocks/taskData";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ ok: true, time: new Date().toISOString() });
  }),

  // 태스크 목록 조회 (타임스탬프 보정 포함)
  http.get("/api/tasks", () => {
    const seeded = mockTasks.map((t, idx) => {
      // 기존 값이 있으면 유지, 없으면 기준일에서 -idx 일로 시드
      const base = new Date();
      base.setDate(base.getDate() - (mockTasks.length - idx));
      const createdAt = t.createdAt ?? new Date(base.getTime()).toISOString();
      const updatedAt =
        t.updatedAt ??
        new Date(base.getTime() + 3 * 60 * 60 * 1000).toISOString();
      const qaApprovedAt =
        t.status === "DONE" ? (t.qaApprovedAt ?? updatedAt) : t.qaApprovedAt;
      return { ...t, createdAt, updatedAt, qaApprovedAt } as Task;
    });
    // mockTasks에 보정값 반영 (다음 요청 일관성)
    for (let i = 0; i < mockTasks.length; i++) {
      mockTasks[i] = { ...(seeded[i] as Task) };
    }
    return HttpResponse.json(seeded);
  }),

  // 태스크 상태 업데이트 (드래그 앤 드롭)
  http.patch("/api/tasks/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<Task>;

    const taskIndex = mockTasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const next: Task = {
      ...mockTasks[taskIndex],
      ...body,
      updatedAt: now,
      ...(body.status === "DONE" ? { qaApprovedAt: now } : {}),
    } as Task;
    mockTasks[taskIndex] = next;
    return HttpResponse.json(next);
  }),
];
