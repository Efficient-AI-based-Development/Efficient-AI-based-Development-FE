import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../../types/task";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type: Task["type"]) => {
    return type === "CODE" ? "bg-primary" : "bg-yellow-400";
  };

  const getTypeName = (type: Task["type"]) => {
    return type === "CODE" ? "CODE" : "DESIGN";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-[12px] p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-200"
    >
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
