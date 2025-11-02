import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TaskTag from "./TaskTag";
import type { Task } from "../../../types/task";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: string, content: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdate,
}: TaskDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content || "");

  const handleSave = () => {
    onUpdate(task.id, editedContent);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white">
        {/* 헤더 */}
        <DialogHeader className="px-6 pt-8 pb-4">
          <div className="mb-3">
            <TaskTag type={task.type} number={task.typeNumber} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-2xl font-bold">
              {task.title}
            </DialogTitle>
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
            <div className="border border-gray-300 rounded-lg p-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[400px] font-mono text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none p-0"
                placeholder="마크다운 형식으로 내용을 입력하세요..."
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-6 overflow-y-auto max-h-[60vh]">
              {task.content ? (
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-4 mb-3 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mt-3 mb-2">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 my-2">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start text-sm">
                        <span className="mr-2">-</span>
                        <span>{children}</span>
                      </li>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed my-2">{children}</p>
                    ),
                  }}
                >
                  {task.content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  내용이 없습니다.
                </p>
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
                onClick={() => setIsEditMode(false)}
                variant="outline"
                className="px-6"
              >
                미리보기
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
                onClick={() => {
                  /* TODO: 다음 Task로 이동 로직 */
                }}
                className="px-8 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
              >
                다음
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
