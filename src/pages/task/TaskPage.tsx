import TaskHeader from "./components/TaskHeader";

export default function TaskPage() {
  const mockStats = {
    totalTasks: 17,
    completionRate: 20,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <TaskHeader stats={mockStats} />
    </div>
  );
}
