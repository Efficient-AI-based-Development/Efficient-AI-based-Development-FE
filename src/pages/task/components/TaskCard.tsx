import type { Task } from "../../../types/task";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getTypeColor = (type: Task["type"]) => {
    return type === "CODE" ? "bg-primary" : "bg-yellow-400";
  };

  const getTypeName = (type: Task["type"]) => {
    return type === "CODE" ? "CODE" : "DESIGN";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
      {/* 태그 */}
      <div className="mb-3">
        <span
          className={`${getTypeColor(task.type)} text-white text-xs font-semibold px-3 py-1 rounded-full`}
        >
          {getTypeName(task.type)}#{task.typeNumber}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-customBlack font-medium mb-3">{task.title}</h3>

      {/* 중요도 */}
      <div className="flex items-center justify-end">
        <span className="text-sm text-gray-500">중요도 :</span>
        <span className="text-red-500 font-semibold ml-1">{task.priority}</span>
      </div>
    </div>
  );
}
