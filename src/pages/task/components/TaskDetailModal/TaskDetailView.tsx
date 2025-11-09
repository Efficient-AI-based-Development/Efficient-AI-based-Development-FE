import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import TaskTag from "../TaskTag";
import { markdownComponents } from "./markdownComponents";
import type { Task, TaskType } from "../../../../types/task";

interface TaskDetailViewProps {
  task: Task;
  onUpdate: (content: string) => void;
  onUpdateType?: (type: TaskType) => void;
  onUpdatePriority?: (priority: number) => void;
  onNext: () => void;
  onDelete?: () => void;
}

export default function TaskDetailView({
  task,
  onUpdate,
  onUpdateType,
  onUpdatePriority,
  onNext,
  onDelete,
}: TaskDetailViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content || "");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedType, setSelectedType] = useState<TaskType>(task.type);
  const [priority, setPriority] = useState<number>(task.priority);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // task가 변경될 때 state 업데이트
  useEffect(() => {
    setSelectedType(task.type);
    setPriority(task.priority);
    setEditedContent(task.content || "");
  }, [task.id, task.type, task.priority, task.content]);

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

  return (
    <>
      <DialogHeader className="px-6 pt-8">
        <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
      </DialogHeader>

      {/* 컨텐츠 */}
      <div className="px-6 space-y-6">
        {/* 태그 선택과 중요도를 하나의 박스에 */}
        <div className="border border-primary/30 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-8">
            {/* 태그 선택 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">태그</span>
              <div className="flex gap-3">
                <TaskTag
                  type="DEV"
                  isButton
                  isSelected={selectedType === "DEV"}
                  onClick={() => handleTypeChange("DEV")}
                />
                <TaskTag
                  type="DESIGN"
                  isButton
                  isSelected={selectedType === "DESIGN"}
                  onClick={() => handleTypeChange("DESIGN")}
                />
                <TaskTag
                  type="DOCS"
                  isButton
                  isSelected={selectedType === "DOCS"}
                  onClick={() => handleTypeChange("DOCS")}
                />
              </div>
            </div>

            {/* 중요도 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  중요도
                </span>
                <span className="font-bold text-red-500">{priority}</span>
              </div>
              <div className="space-y-1">
                <Slider
                  value={[priority]}
                  onValueChange={handlePriorityChange}
                  min={0}
                  max={10}
                  step={1}
                />
                <div className="relative w-full">
                  <div className="flex justify-between pl-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <span key={num} className="text-xs text-gray-400">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 마크다운 컨텐츠 */}
        {isEditMode ? (
          <div className="border border-gray-300 rounded-lg overflow-hidden relative">
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
              className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors z-10 shadow-lg"
            >
              미리보기
            </button>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-6 overflow-y-auto min-h-[330px]">
            {task.content ? (
              <ReactMarkdown components={markdownComponents}>
                {task.content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 text-center py-8">내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pt-4 pb-6 flex justify-between items-center gap-3">
        {isEditMode ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
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
    </>
  );
}
