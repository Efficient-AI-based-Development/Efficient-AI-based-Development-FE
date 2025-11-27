import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { Trash2, Files, FileCheck, Clock, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TaskTagAndPrioritySelector from "../TaskTagAndPrioritySelector";
import ReviewActionButtons from "./ReviewActionButtons";
import { markdownComponents } from "./markdownComponents";
import type { Task, TaskType } from "../../../../types/task";
import { getTaskCommand } from "../../../mcp/services/mcpService";

interface TaskDetailViewProps {
  task: Task;
  onUpdate: (content: string) => void;
  onUpdateType?: (type: TaskType) => void;
  onUpdatePriority?: (priority: number) => void;
  onNext: () => void;
  onDelete?: () => void;
  onReject?: () => void;
  onApprove?: () => void;
  onAddMore?: () => void;
}

export default function TaskDetailView({
  task,
  onUpdate,
  onUpdateType,
  onUpdatePriority,
  onNext,
  onDelete,
  onReject,
  onApprove,
  onAddMore,
}: TaskDetailViewProps) {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content || "");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedType, setSelectedType] = useState<TaskType>(task.type);
  const [priority, setPriority] = useState<number>(task.priority);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"command" | "logs">("command");
  const [isCopyingCommand, setIsCopyingCommand] = useState(false);

  // task가 변경될 때 state 업데이트
  useEffect(() => {
    setSelectedType(task.type);
    setPriority(task.priority);
    setEditedContent(task.content || "");
    if (task.status === "DONE") {
      setActiveTab("command");
    }
  }, [task.id, task.type, task.priority, task.content, task.status]);

  const handleSave = () => {
    onUpdate(editedContent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedContent(task.content || "");
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setEditedContent(task.content || "");
    setIsEditMode(true);
  };

  const handleTypeChange = (type: TaskType) => {
    setSelectedType(type);
    onUpdateType?.(type);
  };

  const handlePriorityChange = (value: number[]) => {
    const newPriority = value[0];
    setPriority(newPriority);
    onUpdatePriority?.(newPriority);
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  // 소요 시간 포맷팅 함수
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}분 ${remainingSeconds}초`
        : `${minutes}분`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return remainingMinutes > 0
        ? `${hours}시간 ${remainingMinutes}분`
        : `${hours}시간`;
    }
  };

  // 명령어 복사 핸들러
  const handleCopyCommand = async () => {
    try {
      setIsCopyingCommand(true);
      const taskId = Number(task.id);
      if (isNaN(taskId)) {
        toast({
          title: "태스크 ID가 유효하지 않습니다.",
          variant: "destructive",
        });
        return;
      }

      const result = await getTaskCommand(taskId, "cursor");
      await navigator.clipboard.writeText(result.command);

      toast({
        title: "명령어가 복사되었습니다!",
        description:
          result.description || "Cursor의 MCP 채팅창에 붙여넣으세요.",
        duration: 5000,
      });
    } catch (error) {
      console.error("[TaskDetailView] 명령어 복사 실패:", error);
      toast({
        title: "명령어 복사에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCopyingCommand(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      <DialogHeader className="px-6 pt-8 flex-shrink-0">
        <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
      </DialogHeader>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col px-6 py-4 min-h-0">
        {/* 태그 선택과 중요도를 하나의 박스에 - 고정 */}
        <div className="flex-shrink-0 mb-6">
          <TaskTagAndPrioritySelector
            selectedType={selectedType}
            priority={priority}
            onTypeChange={handleTypeChange}
            onPriorityChange={(value) => handlePriorityChange([value])}
            disabled={task.status !== "TODO"}
          />
        </div>

        {/* 스크롤 가능 영역 - 결과 로그 탭일 때는 결과 정보 + 마크다운, 명령어 프롬프트 탭일 때는 마크다운만 */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* DONE 상태이고 결과 로그 탭일 때만 작업 결과 정보 표시 */}
          {task.status === "DONE" && activeTab === "logs" && (
            <div className="space-y-4">
              {/* 생성/수정된 파일 목록 */}
              {task.resultFiles && task.resultFiles.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Files className="w-4 h-4" />
                    <span>생성/수정된 파일</span>
                  </h3>
                  <ul className="space-y-1">
                    {task.resultFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="text-gray-400">•</span>
                        <span className="font-mono">{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 작업 요약 */}
              {task.summary && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>작업 요약</span>
                  </h3>
                  <p className="text-sm text-gray-600">{task.summary}</p>
                </div>
              )}

              {/* 소요 시간 */}
              {task.duration && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>작업 소요 시간</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDuration(task.duration)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 마크다운 컨텐츠 */}
          {isEditMode ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden relative shadow-md bg-white">
              <MDEditor
                value={editedContent}
                onChange={(val) => setEditedContent(val || "")}
                height={330}
                preview={showPreview ? "preview" : "edit"}
                hideToolbar={false}
                visibleDragbar={false}
              />
              <button
                onMouseDown={() => setShowPreview(true)}
                onMouseUp={() => setShowPreview(false)}
                onMouseLeave={() => setShowPreview(false)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-all z-10 shadow-lg hover:shadow-xl hover:scale-105"
              >
                미리보기
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-6 min-h-[330px] bg-gradient-to-br from-gray-50 to-white shadow-sm">
              {task.status === "DONE" && activeTab === "logs" ? (
                task.resultLogs ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {task.resultLogs}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[250px]">
                    <p className="text-gray-400 text-center text-sm">
                      결과 로그가 없습니다.
                    </p>
                  </div>
                )
              ) : task.content ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {task.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[250px]">
                  <p className="text-gray-400 text-center text-sm">
                    내용이 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼/탭 - 고정 */}
      <div className="px-6 pt-4 pb-6 flex-shrink-0 border-t border-gray-100">
        {task.status === "DONE" ? (
          // DONE 상태: 탭만 표시
          <div className="bg-gray-100 rounded-lg p-1 flex gap-2">
            <button
              onClick={() => setActiveTab("command")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "command"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              명령어 프롬프트
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              결과 로그 보러가기
            </button>
          </div>
        ) : task.status === "REVIEW" ? (
          <ReviewActionButtons
            onReject={onReject}
            onApprove={onApprove}
            onAddMore={onAddMore}
          />
        ) : isEditMode ? (
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-3">
              {onDelete && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-6 bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCancel} variant="outline" className="px-6">
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="px-6 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
              >
                저장
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-3">
              {onDelete && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-6 bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              )}
              <Button
                onClick={handleCopyCommand}
                disabled={isCopyingCommand}
                variant="outline"
                className="px-6 outline-none focus:outline-none focus-visible:outline-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                {isCopyingCommand ? "복사 중..." : "명령어 복사"}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                className="px-8 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
              >
                수정
              </Button>
              <Button
                onClick={onNext}
                className="px-8 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight py-2">
              태스크 삭제
            </DialogTitle>
            <DialogDescription>
              정말로 이 태스크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
