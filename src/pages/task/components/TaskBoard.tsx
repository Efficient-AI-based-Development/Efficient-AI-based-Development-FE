import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import type { Task, TaskType } from "../../../types/task";

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: Task["status"]) => void;
  onAddTask: (data: {
    type: TaskType;
    priority: number;
    message: string;
  }) => void;
}

export default function TaskBoard({
  tasks,
  onTaskUpdate,
  onAddTask,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as Task["status"];

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskUpdate(taskId, newStatus);
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            count={getTaskCount(column.status)}
            tasks={tasks}
            bgColor={column.bgColor}
            onAddTask={column.status === "TODO" ? onAddTask : undefined}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
