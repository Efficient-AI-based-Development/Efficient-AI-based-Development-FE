import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import TaskTag from "../TaskTag";
import type { Task } from "../../../../types/task";

interface TaskCommandViewProps {
  task: Task;
  projectId: string;
  onComplete: () => void;
  onLater: () => void;
}

export default function TaskCommandView({
  task,
  projectId,
  onComplete,
  onLater,
}: TaskCommandViewProps) {
  const { toast } = useToast();
  const command = `vooster-ai를 사용해서 ${projectId}의 ${task.taskCode || task.id} 작업 수행하라`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "복사되었습니다!",
        duration: 3000,
      });
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      toast({
        title: "복사 실패",
        variant: "destructive",
        duration: 3000,
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
          <Copy className="w-5 h-5 text-gray-600 flex-shrink-0" />
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
