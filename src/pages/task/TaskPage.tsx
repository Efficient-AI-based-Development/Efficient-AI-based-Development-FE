import TaskHeader from "./components/TaskHeader";
import TaskCard from "./components/TaskCard";

export default function TaskPage() {
  const mockStats = {
    totalTasks: 17,
    completionRate: 20,
  };

  const mockTask = {
    id: "1",
    title: "홈페이지 화면 구현",
    type: "CODE" as const,
    typeNumber: 1,
    status: "TODO" as const,
    priority: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <TaskHeader stats={mockStats} />

      {/* 임시로 TaskCard 미리보기 */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">TaskCard 미리보기</h2>
        <div className="grid grid-cols-4 gap-4">
          <TaskCard task={mockTask} />
          <TaskCard task={{ ...mockTask, type: "DESIGN", id: "2" }} />
        </div>
      </div>
    </div>
  );
}
