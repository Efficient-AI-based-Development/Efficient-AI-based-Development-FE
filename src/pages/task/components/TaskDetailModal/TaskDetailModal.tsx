import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TaskDetailView from "./TaskDetailView";
import TaskCommandView from "./TaskCommandView";
import type { Task, TaskType } from "../../../../types/task";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  onUpdate: (taskId: string, content: string) => void;
  onUpdateType?: (taskId: string, type: TaskType) => void;
  onUpdatePriority?: (taskId: string, priority: number) => void;
  onStartTask: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectId,
  onUpdate,
  onUpdateType,
  onUpdatePriority,
  onStartTask,
  onDelete,
}: TaskDetailModalProps) {
  const [step, setStep] = useState<"detail" | "command">("detail");

  // task가 변경될 때 상태 초기화
  useEffect(() => {
    setStep("detail");
  }, [task.id]);

  const handleUpdateContent = (content: string) => {
    onUpdate(task.id, content);
  };

  const handleUpdateType = (type: TaskType) => {
    onUpdateType?.(task.id, type);
  };

  const handleUpdatePriority = (priority: number) => {
    onUpdatePriority?.(task.id, priority);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
    onClose();
  };

  const handleNext = () => {
    setStep("command");
  };

  const handleComplete = () => {
    onStartTask(task.id);
    onClose();
  };

  const handleLater = () => {
    setStep("detail");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl min-h-[75vh] p-0 bg-white">
        {step === "detail" ? (
          <TaskDetailView
            task={task}
            onUpdate={handleUpdateContent}
            onUpdateType={handleUpdateType}
            onUpdatePriority={handleUpdatePriority}
            onNext={handleNext}
            onDelete={handleDelete}
          />
        ) : (
          <TaskCommandView
            task={task}
            projectId={projectId}
            onComplete={handleComplete}
            onLater={handleLater}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
