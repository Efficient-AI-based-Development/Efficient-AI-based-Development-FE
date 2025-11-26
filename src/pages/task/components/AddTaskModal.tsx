import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TaskTagAndPrioritySelector from "./TaskTagAndPrioritySelector";
import type { TaskType } from "../../../types/task";
import {
  startChatWithInitFile,
  sendMessage,
  getStream,
  cancelSession,
} from "../services/chatService";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TaskType;
    priority: number;
    message: string;
  }) => void;
  projectId: number;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
}: AddTaskModalProps) {
  const [selectedType, setSelectedType] = useState<TaskType>("DEV");
  const [priority, setPriority] = useState<number>(5);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; options?: string[] }>
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [canCreateTask, setCanCreateTask] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 새 메시지가 추가되면 스크롤을 맨 아래로
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 모달이 닫힐 때 세션 취소 및 초기화
  useEffect(() => {
    if (!isOpen && chatSessionId !== null) {
      // 세션 취소
      cancelSession(chatSessionId).catch((error) => {
        console.error("세션 취소 실패:", error);
      });
      setChatSessionId(null);
      // 스트리밍 중단
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // 상태 초기화
      setMessages([]);
      setInputValue("");
      setSelectedOptions([]);
      setShowOptions(false);
      setCanCreateTask(false);
    }
  }, [isOpen, chatSessionId]);

  // 스트리밍 응답에서 선택지와 canCreateTask 파싱
  const parseStreamResponse = (
    content: string,
  ): {
    options?: string[];
    canCreateTask?: boolean;
  } => {
    const result: { options?: string[]; canCreateTask?: boolean } = {};

    // 선택지 파싱 (예: "options: [항목1, 항목2, 항목3]")
    const optionsMatch = content.match(/options:\s*\[(.*?)\]/s);
    if (optionsMatch) {
      const optionsText = optionsMatch[1];
      const options = optionsText
        .split(",")
        .map((opt) => opt.trim().replace(/^["']|["']$/g, ""))
        .filter((opt) => opt.length > 0);
      if (options.length > 0) {
        result.options = options;
      }
    }

    // canCreateTask 파싱 (예: "canCreateTask: true")
    const canCreateMatch = content.match(/canCreateTask:\s*(true|false)/i);
    if (canCreateMatch) {
      result.canCreateTask = canCreateMatch[1].toLowerCase() === "true";
    }

    return result;
  };

  // 채팅 세션 시작
  const initializeChatSession = async (initialMessage: string) => {
    try {
      const response = await startChatWithInitFile({
        content_md: initialMessage,
        file_type: "PROJECT",
        project_id: projectId,
      });
      setChatSessionId(response.chat_id);
      return response.chat_id;
    } catch (error) {
      console.error("채팅 세션 시작 실패:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    // 토큰 확인 (백엔드가 쿠키 기반 인증을 사용할 수도 있으므로 토큰이 없어도 시도)
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const devMode = localStorage.getItem("devMode") === "true";
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // 토큰이 없고 로그인도 안 된 경우에만 에러 표시
    // 백엔드가 쿠키 기반 인증을 사용하는 경우 토큰 없이도 작동할 수 있음
    if (!token && !isLoggedIn && !devMode) {
      const errorMessage = {
        role: "assistant" as const,
        content:
          "인증이 필요합니다. 로그인 후 다시 시도해주세요.\n\n백엔드가 쿠키 기반 인증을 사용하는 경우, 로그인 후 쿠키가 자동으로 전송됩니다.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // 토큰이 없지만 로그인 상태인 경우 경고만 표시하고 계속 진행
    // (백엔드가 쿠키 기반 인증을 사용할 수 있으므로)
    if (!token && isLoggedIn) {
      console.warn(
        "[AddTaskModal] isLoggedIn은 true이지만 토큰이 없습니다. 쿠키 기반 인증을 사용할 수 있습니다.",
      );
    }

    setIsSending(true);

    // 사용자 메시지 추가
    const userMessage = { role: "user" as const, content: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue("");

    try {
      let sessionId = chatSessionId;

      // 첫 메시지인 경우 세션 시작
      if (sessionId === null) {
        sessionId = await initializeChatSession(currentInput);
        setChatSessionId(sessionId); // 세션 ID 저장
      } else {
        // 기존 세션에 메시지 전송
        await sendMessage(sessionId, {
          content_md: currentInput,
        });
      }

      // 스트리밍 응답을 받을 메시지 추가 (빈 상태로 시작)
      const assistantMessageIndex = messages.length;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", options: undefined },
      ]);

      let streamedContent = "";

      // 스트리밍 응답 처리
      await getStream(
        sessionId,
        (data: string) => {
          streamedContent += data;
          // 실시간으로 메시지 업데이트
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: streamedContent,
              };
            }
            return updated;
          });
        },
        (error: Error) => {
          console.error("스트리밍 에러:", error);
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content:
                  streamedContent ||
                  "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
              };
            }
            return updated;
          });
        },
        () => {
          // 스트리밍 완료 후 파싱
          const parsed = parseStreamResponse(streamedContent);

          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: streamedContent,
                options: parsed.options,
              };
            }
            return updated;
          });

          if (parsed.options) {
            setShowOptions(true);
            setSelectedOptions([]);
          }

          setCanCreateTask(parsed.canCreateTask ?? false);
        },
      );
    } catch (error) {
      console.error("메시지 전송 실패:", error);

      // 에러 타입에 따라 다른 메시지 표시
      const axiosError = error as {
        response?: { status?: number; data?: { detail?: string } };
        message?: string;
      };
      const devMode = localStorage.getItem("devMode") === "true";
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      let errorContent =
        "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.";

      if (axiosError.response?.status === 403) {
        const detail = axiosError.response?.data?.detail;
        if (detail === "Not authenticated" || !token) {
          if (devMode) {
            errorContent =
              "개발 모드에서 인증 토큰이 필요합니다.\n\nlocalStorage에 'token' 또는 'accessToken' 키를 추가해주세요.\n또는 실제 로그인을 통해 토큰을 받아주세요.";
          } else {
            errorContent =
              "인증이 필요합니다. 페이지를 새로고침하거나 다시 로그인해주세요.";
          }
        } else {
          errorContent =
            "권한이 없습니다. 프로젝트에 대한 접근 권한을 확인해주세요.";
        }
      } else if (axiosError.response?.status === 401) {
        errorContent =
          "인증 토큰이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요.";
      } else if (axiosError.message) {
        errorContent = `오류가 발생했습니다: ${axiosError.message}`;
      }

      // 에러 처리
      const errorMessage = {
        role: "assistant" as const,
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = () => {
    if (messages.length === 0) return;

    onSubmit({
      type: selectedType,
      priority,
      message: messages.map((m) => m.content).join("\n"),
    });

    // 모달 초기화
    setMessages([]);
    setInputValue("");
    setSelectedOptions([]);
    setShowOptions(false);
    setCanCreateTask(false);
    onClose();
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const handleContinueChat = async () => {
    if (selectedOptions.length === 0 || !chatSessionId) return;

    const selectedText = `다음 항목들을 선택했습니다:\n${selectedOptions.map((o) => `- ${o}`).join("\n")}`;
    const userMessage = { role: "user" as const, content: selectedText };
    setMessages((prev) => [...prev, userMessage]);

    setIsSending(true);
    setShowOptions(false);

    try {
      // 메시지 전송
      await sendMessage(chatSessionId, {
        content_md: selectedText,
      });

      // 스트리밍 응답을 받을 메시지 추가
      const assistantMessageIndex = messages.length;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", options: undefined },
      ]);

      let streamedContent = "";

      // 스트리밍 응답 처리
      await getStream(
        chatSessionId,
        (data: string) => {
          streamedContent += data;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: streamedContent,
              };
            }
            return updated;
          });
        },
        (error: Error) => {
          console.error("스트리밍 에러:", error);
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content:
                  streamedContent ||
                  "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
              };
            }
            return updated;
          });
        },
        () => {
          // 스트리밍 완료 후 파싱
          const parsed = parseStreamResponse(streamedContent);

          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: streamedContent,
                options: parsed.options,
              };
            }
            return updated;
          });

          if (parsed.options) {
            setShowOptions(true);
            setSelectedOptions([]);
          }

          setCanCreateTask(parsed.canCreateTask ?? true); // 선택 완료 후 일반적으로 Task 생성 가능
        },
      );
    } catch (error) {
      console.error("메시지 전송 실패:", error);

      // 에러 타입에 따라 다른 메시지 표시
      const axiosError = error as { response?: { status?: number } };
      let errorContent =
        "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.";

      if (
        axiosError.response?.status === 403 ||
        axiosError.response?.status === 401
      ) {
        errorContent = "인증이 필요합니다. 로그인 페이지로 이동합니다.";
      }

      const errorMessage = {
        role: "assistant" as const,
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white">
        {/* 헤더 */}
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-xl font-bold">Task 추가하기</DialogTitle>
          <DialogDescription className="sr-only">
            새로운 태스크를 생성하는 모달입니다. 태그와 중요도를 설정한 후 작업
            내용을 입력하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 컨텐츠 */}
        <div className="px-6 pb-4 space-y-6">
          {/* 태그 선택과 중요도를 하나의 박스에 */}
          <TaskTagAndPrioritySelector
            selectedType={selectedType}
            priority={priority}
            onTypeChange={setSelectedType}
            onPriorityChange={setPriority}
            disabled={false}
          />

          {/* 안내 메시지 + 채팅 영역 */}
          <div className="h-[300px] overflow-y-auto space-y-3">
            {/* 안내 메시지 */}
            <div className="bg-gray-100 rounded-[4px] p-4 w-[70%]">
              <p className="text-gray-700 leading-relaxed">
                좋아요! 새로운 작업이군요! 상단의 태그와 중요도를 설정한 후,
                새롭게 추가하고 싶은 기능을 설명해주세요
                <br />
                ex) 로그인 기능을 추가하고 싶어
              </p>
            </div>

            {/* 채팅 메시지들 */}
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* 선택지가 있는 경우 - 메시지 버블 안에 */}
                    {message.options &&
                      index === messages.length - 1 &&
                      showOptions && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold">선택지 버튼 :</p>
                          {message.options.map((option) => (
                            <div
                              key={option}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={option}
                                checked={selectedOptions.includes(option)}
                                onCheckedChange={() =>
                                  handleOptionToggle(option)
                                }
                              />
                              <label
                                htmlFor={option}
                                className="text-sm cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                          <Button
                            onClick={handleContinueChat}
                            disabled={selectedOptions.length === 0}
                            size="sm"
                            className="w-full bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 mt-3"
                          >
                            확인
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
            {/* 스크롤 앵커 */}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="w-full min-h-[100px] resize-none pr-16 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={showOptions}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={isSending || showOptions}
                className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 focus:outline-none focus-visible:outline-none"
              >
                <Send className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 버튼 영역 */}
            {messages.length > 0 && (
              <div className="flex gap-3 items-center">
                {/* 아니야, AI랑 대화할래 버튼 */}
                {showOptions && (
                  <Button
                    onClick={() => {
                      setShowOptions(false);
                      setSelectedOptions([]);
                    }}
                    className="flex-1 bg-black text-white hover:bg-black/90"
                  >
                    아니야, AI랑 대화할래
                  </Button>
                )}

                {/* Task 생성하기 버튼 */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canCreateTask}
                  className={`px-6 font-semibold text-white bg-black hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed ${showOptions ? "" : "ml-auto"}`}
                >
                  Task 생성하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
