import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
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
  onTaskClick: (task: Task) => void;
}

export default function TaskBoard({
  tasks,
  onTaskUpdate,
  onAddTask,
  onTaskClick,
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

    // over.id가 status인지 확인 (column에 드랍) 또는 다른 task의 id인지 확인
    let newStatus: Task["status"] | undefined;

    // over.id가 status 중 하나인지 확인
    const validStatuses: Task["status"][] = [
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "DONE",
    ];
    if (validStatuses.includes(over.id as Task["status"])) {
      newStatus = over.id as Task["status"];
    } else {
      // 다른 task 위에 드랍한 경우, 그 task의 status를 찾음
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && newStatus && task.status !== newStatus) {
      onTaskUpdate(taskId, newStatus);
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="cursor-grabbing rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
