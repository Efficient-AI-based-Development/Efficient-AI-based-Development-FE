import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TaskTag from "../TaskTag";
import type { Task } from "../../../../types/task";

interface TaskCommandViewProps {
  task: Task;
  projectName: string;
  onComplete: () => void;
  onLater: () => void;
}

export default function TaskCommandView({
  task,
  projectName,
  onComplete,
  onLater,
}: TaskCommandViewProps) {
  const { toast } = useToast();
  const command = `vooster-ai를 사용해서 ${projectName}의 ${task.taskCode || task.id} 작업 수행하라`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "복사되었습니다!",
        duration: 5000,
      });
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      toast({
        title: "복사 실패",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <DialogHeader className="px-6 pt-8 pb-2">
        <div className="mb-3">
          <TaskTag type={task.type} number={task.typeNumber} />
        </div>
        <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
      </DialogHeader>

      <div className="px-6 pb-6 flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <p className="text-gray-600 text-center">
          명령어를 복사해서 Cursor에 입력하세요
        </p>
        <div
          onClick={handleCopy}
          className="w-full max-w-xl border border-gray-300 rounded-lg p-4 bg-gray-50 flex cursor-pointer items-center gap-3 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="flex-1 text-sm text-gray-700">{command}</p>
        </div>
      </div>

      <div className="px-6 py-4 flex justify-end gap-3">
        <Button onClick={onLater} variant="outline" className="px-8">
          나중에
        </Button>
        <Button
          onClick={onComplete}
          className="px-8 bg-black text-white hover:bg-black/90"
        >
          완료
        </Button>
      </div>
    </>
  );
}
