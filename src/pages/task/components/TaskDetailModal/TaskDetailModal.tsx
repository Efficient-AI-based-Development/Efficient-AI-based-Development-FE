import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TaskDetailView from "./TaskDetailView";
import TaskCommandView from "./TaskCommandView";
import type { Task } from "../../../../types/task";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectName: string;
  onUpdate: (taskId: string, content: string) => void;
  onStartTask: (taskId: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectName,
  onUpdate,
  onStartTask,
}: TaskDetailModalProps) {
  const [step, setStep] = useState<"detail" | "command">("detail");

  // task가 변경될 때 상태 초기화
  useEffect(() => {
    setStep("detail");
  }, [task.id]);

  const handleUpdateContent = (content: string) => {
    onUpdate(task.id, content);
  };

  const handleNext = () => {
    setStep("command");
  };

  const handleComplete = () => {
    onStartTask(task.id);
    onClose();
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl min-h-[80vh] p-0 bg-white">
        {step === "detail" ? (
          <TaskDetailView
            task={task}
            onUpdate={handleUpdateContent}
            onNext={handleNext}
          />
        ) : (
          <TaskCommandView
            task={task}
            projectName={projectName}
            onComplete={handleComplete}
            onLater={handleLater}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
