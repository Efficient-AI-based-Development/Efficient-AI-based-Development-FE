import { useState, useEffect } from "react";
import TaskHeader from "./components/TaskHeader";
import TaskBoard from "./components/TaskBoard";
import type { Task } from "../../types/task";

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 태스크 목록 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 태스크 상태 업데이트
  const handleTaskUpdate = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      // 낙관적 업데이트 (Optimistic Update)
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );

      // API 호출
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      // 에러 발생 시 다시 불러오기
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
  };

  // 통계 계산
  const stats = {
    totalTasks: tasks.length,
    completionRate: tasks.length
      ? Math.round(
          (tasks.filter((task) => task.status === "DONE").length /
            tasks.length) *
            100,
        )
      : 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <TaskHeader stats={stats} />
      <TaskBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
    </div>
  );
}
