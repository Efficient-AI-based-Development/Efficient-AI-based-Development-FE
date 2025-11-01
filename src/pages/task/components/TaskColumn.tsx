import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "../../../types/task";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  count: number;
  tasks: Task[];
  bgColor: string;
}

export default function TaskColumn({
  title,
  status,
  count,
  tasks,
  bgColor,
}: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const columnTasks = tasks.filter((task) => task.status === status);
  const taskIds = columnTasks.map((task) => task.id);

  return (
    <div className="flex flex-col h-full">
      {/* 컬럼 헤더 */}
      <div>
        <div
          className={`${bgColor} text-white rounded-[12px] px-4 py-3 flex items-center justify-between`}
        >
          <span className="font-semibold text-lg">
            {title} : {count}
          </span>
        </div>
      </div>

      {/* 카드 리스트 */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 py-4 min-h-[500px] space-y-4">
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {/* 추가하기 버튼 - To Do 컬럼에만 표시 */}
          {status === "TODO" && (
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              <span>추가하기</span>
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
