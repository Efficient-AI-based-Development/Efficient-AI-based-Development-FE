import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskTag from "./TaskTag";
import type { Task } from "../../../types/task";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: string, content: string) => void;
  onStartTask: (taskId: string) => void; // Task를 IN_PROGRESS로 변경
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onStartTask,
}: TaskDetailModalProps) {
  const [step, setStep] = useState<"detail" | "command">("detail"); // 화면 단계 (상세 → 명령어)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content || "");
  const [showPreview, setShowPreview] = useState(false);

  // task가 변경될 때 상태 초기화
  useEffect(() => {
    setStep("detail"); // 상세 화면부터 시작
    setIsEditMode(false);
    setEditedContent(task.content || "");
    setShowPreview(false);
  }, [task.id, task.content]);

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
      <DialogContent className="max-w-3xl min-h-[80vh] p-0 bg-white">
        {step === "detail" ? (
          // 1단계: 상세 화면 (마크다운)
          <>
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
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="px-6"
                  >
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
                    onClick={() => setStep("command")}
                    className="px-8 bg-black text-white hover:bg-black/90 outline-none focus:outline-none focus-visible:outline-none"
                  >
                    다음
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          // 2단계: 명령어 화면
          <>
            <DialogHeader className="px-6 pt-8 pb-4">
              <div className="mb-3">
                <TaskTag type={task.type} number={task.typeNumber} />
              </div>
              <DialogTitle className="text-2xl font-bold">
                {task.title}
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 pb-6 flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <p className="text-gray-600 text-center">
                명령어를 복사해서 Cursor에 입력하세요
              </p>
              <div className="w-full max-w-xl border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center gap-3">
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
                <p className="flex-1 text-sm text-gray-700">
                  vooster-ai를 사용해서 4Y3M 프로젝트의 T-001 작업 수행하라
                </p>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-3">
              <Button onClick={onClose} variant="outline" className="px-8">
                나중에
              </Button>
              <Button
                onClick={() => {
                  onStartTask(task.id);
                  onClose();
                }}
                className="px-8 bg-black text-white hover:bg-black/90"
              >
                완료
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
