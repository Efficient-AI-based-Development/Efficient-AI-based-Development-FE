import TaskColumn from "./TaskColumn";
import type { Task } from "../../../types/task";

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const columns = [
    {
      title: "To Do",
      status: "TODO" as const,
      bgColor: "bg-customBlack",
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS" as const,
      bgColor: "bg-secondary",
    },
    {
      title: "Review",
      status: "REVIEW" as const,
      bgColor: "bg-primary",
    },
    {
      title: "Done",
      status: "DONE" as const,
      bgColor: "bg-gray-600",
    },
  ];

  const getTaskCount = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status).length;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((column) => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          count={getTaskCount(column.status)}
          tasks={tasks}
          bgColor={column.bgColor}
        />
      ))}
    </div>
  );
}
