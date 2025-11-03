import { useState } from "react";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskTag from "../TaskTag";
import { markdownComponents } from "./markdownComponents";
import type { Task } from "../../../../types/task";

interface TaskDetailViewProps {
  task: Task;
  onUpdate: (content: string) => void;
  onNext: () => void;
}

export default function TaskDetailView({
  task,
  onUpdate,
  onNext,
}: TaskDetailViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content || "");
  const [showPreview, setShowPreview] = useState(false);

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

  return (
    <>
      <DialogHeader className="px-6 pt-8 pb-4">
        <div className="mb-3">
          <TaskTag type={task.type} number={task.typeNumber} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-gray-700">중요도 :</span>
            <span className="text-red-500 font-bold text-xl">
              {task.priority}
            </span>
          </div>
        </div>
      </DialogHeader>

      {/* 컨텐츠 */}
      <div className="px-6 pb-4">
        {isEditMode ? (
          <div className="border border-gray-300 rounded-lg overflow-hidden relative">
            <MDEditor
              value={editedContent}
              onChange={(val) => setEditedContent(val || "")}
              height={400}
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
          <div className="border border-gray-300 rounded-lg p-6 overflow-y-auto min-h-[400px] max-h-[400px]">
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
      <div className="px-6 py-4 flex justify-end gap-3">
        {isEditMode ? (
          <>
            <Button onClick={handleCancel} variant="outline" className="px-6">
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
            >
              저장
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}
