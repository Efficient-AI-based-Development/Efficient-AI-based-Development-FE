import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../../types/task";
import TaskTag from "./TaskTag";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-white rounded-[12px] p-4 shadow-sm hover:scale-105 transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing border border-gray-200"
    >
      {/* 태그 */}
      <div className="mb-3">
        <TaskTag type={task.type} number={task.typeNumber} />
      </div>

      {/* 제목 */}
      <h3 className="text-customBlack font-semibold group-hover:font-bold mb-3 transition-all">
        {task.title}
      </h3>

      {/* 중요도 */}
      <div className="flex items-center justify-end">
        <span className="text-sm text-gray-500">중요도 :</span>
        <span className="text-red-500 font-bold text-lg ml-1">
          {task.priority}
        </span>
      </div>
    </div>
  );
}
