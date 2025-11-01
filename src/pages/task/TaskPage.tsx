import TaskHeader from "./components/TaskHeader";
import TaskBoard from "./components/TaskBoard";

export default function TaskPage() {
  const mockStats = {
    totalTasks: 17,
    completionRate: 20,
  };

  const mockTasks = [
    {
      id: "1",
      title: "홈페이지 화면 구현",
      type: "CODE" as const,
      typeNumber: 1,
      status: "TODO" as const,
      priority: 8,
    },
    {
      id: "2",
      title: "홈페이지 화면 구현",
      type: "DESIGN" as const,
      typeNumber: 1,
      status: "TODO" as const,
      priority: 8,
    },
    {
      id: "3",
      title: "홈페이지 화면 구현",
      type: "CODE" as const,
      typeNumber: 1,
      status: "IN_PROGRESS" as const,
      priority: 8,
    },
    {
      id: "4",
      title: "홈페이지 화면 구현",
      type: "CODE" as const,
      typeNumber: 1,
      status: "REVIEW" as const,
      priority: 8,
    },
    {
      id: "5",
      title: "홈페이지 화면 구현",
      type: "DESIGN" as const,
      typeNumber: 1,
      status: "REVIEW" as const,
      priority: 8,
    },
    {
      id: "6",
      title: "홈페이지 화면 구현",
      type: "DESIGN" as const,
      typeNumber: 1,
      status: "REVIEW" as const,
      priority: 8,
    },
    {
      id: "7",
      title: "MCP 연동 완료",
      type: "CODE" as const,
      typeNumber: 1,
      status: "DONE" as const,
      priority: 8,
    },
    {
      id: "8",
      title: "홈페이지 화면 구현",
      type: "DESIGN" as const,
      typeNumber: 1,
      status: "DONE" as const,
      priority: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <TaskHeader stats={mockStats} />
      <TaskBoard tasks={mockTasks} />
    </div>
  );
}
