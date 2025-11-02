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
  const [showPreview, setShowPreview] = useState(false);

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

  // 마크다운 컴포넌트 설정 (공통)
  const markdownComponents = {
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-lg font-bold mt-4 mb-3 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-base font-bold mt-3 mb-2">{children}</h3>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="space-y-1 my-2">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="flex items-start text-sm">
        <span className="mr-2">-</span>
        <span>{children}</span>
      </li>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-sm leading-relaxed my-2">{children}</p>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2">
        {children}
      </pre>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic">
        {children}
      </blockquote>
    ),
    a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
      <a
        href={href}
        className="text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
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
            <div className="border border-gray-300 rounded-lg p-4 relative">
              <div className="max-h-[400px] overflow-y-auto">
                {showPreview ? (
                  <div className="min-h-[400px]">
                    <ReactMarkdown components={markdownComponents}>
                      {editedContent || "내용이 없습니다."}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[400px] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none p-0 resize-none"
                    placeholder="마크다운 형식으로 내용을 입력하세요..."
                  />
                )}
              </div>
              <button
                onMouseDown={() => setShowPreview(true)}
                onMouseUp={() => setShowPreview(false)}
                onMouseLeave={() => setShowPreview(false)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors"
              >
                미리보기
              </button>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-6 overflow-y-auto max-h-[400px]">
              {task.content ? (
                <ReactMarkdown components={markdownComponents}>
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
