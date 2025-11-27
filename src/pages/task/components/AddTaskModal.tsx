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
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [canCreateTask, setCanCreateTask] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setCanCreateTask(false);
    }
  }, [isOpen, chatSessionId]);

  // JSON 메시지를 포맷팅하는 함수
  const formatMessage = (content: string): string => {
    // JSON 형태인지 확인
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        let formatted = "";

        // message.message가 있으면 그것을 사용
        if (parsed.message?.message) {
          formatted = parsed.message.message;
        } else if (parsed.message?.summary) {
          // message.summary가 있으면 그것을 사용
          formatted = parsed.message.summary;
        }

        // suggestions가 있으면 추가
        if (
          parsed.message?.suggestions &&
          Array.isArray(parsed.message.suggestions)
        ) {
          if (formatted) {
            formatted += "\n\n💡 제안사항:\n";
          } else {
            formatted = "💡 제안사항:\n";
          }
          parsed.message.suggestions.forEach((suggestion: string) => {
            formatted += `${suggestion}\n`;
          });
        }

        if (formatted) {
          return formatted;
        }
      }
    } catch {
      // JSON 파싱 실패 시 원본 반환
    }

    return content;
  };

  // 스트리밍 응답에서 canCreateTask 파싱 (선택 옵션 기능 제거)
  const parseStreamResponse = (
    content: string,
  ): {
    canCreateTask?: boolean;
    formattedContent?: string;
  } => {
    const result: { canCreateTask?: boolean; formattedContent?: string } = {};

    // 메시지 포맷팅
    result.formattedContent = formatMessage(content);

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
      const axiosError = error as {
        response?: { status?: number; data?: { detail?: string } };
        message?: string;
      };

      // 404 에러인 경우 더 명확한 메시지 표시
      if (axiosError.response?.status === 404) {
        console.error(
          "채팅 세션 시작 실패: API 엔드포인트를 찾을 수 없습니다 (404)",
          error,
        );
        throw new Error(
          "채팅 API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.",
        );
      }

      console.error("채팅 세션 시작 실패:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || isStreaming) return;

    // 쿠키 기반 인증 사용 (백엔드가 쿠키로 토큰을 전달)
    // withCredentials: true로 설정되어 있어 쿠키가 자동으로 전송됨
    // localStorage 토큰은 선택적으로 확인 (하위 호환성)
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const devMode = localStorage.getItem("devMode") === "true";

    // 로그인도 안 되고 devMode도 아닌 경우에만 에러 표시
    if (!isLoggedIn && !devMode) {
      const errorMessage = {
        role: "assistant" as const,
        content:
          "인증이 필요합니다. 로그인 후 다시 시도해주세요.\n\n백엔드가 쿠키 기반 인증을 사용하므로, 로그인 후 쿠키가 자동으로 전송됩니다.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // 쿠키 기반 인증 사용 중이므로 토큰이 없어도 계속 진행
    if (!token && isLoggedIn) {
      console.log(
        "[AddTaskModal] 쿠키 기반 인증 사용 중. 쿠키가 자동으로 전송됩니다.",
      );
    }

    setIsSending(true);

    // 사용자 메시지와 assistant 메시지(빈 상태)를 함께 추가
    const userMessage = { role: "user" as const, content: inputValue };
    const assistantMessage = { role: "assistant" as const, content: "" };
    let assistantMessageIndex: number;

    setMessages((prev) => {
      const newMessages = [...prev, userMessage, assistantMessage];
      // assistant 메시지 인덱스는 사용자 메시지 추가 후의 인덱스
      assistantMessageIndex = newMessages.length - 1;
      return newMessages;
    });

    const currentInput = inputValue;
    setInputValue("");

    try {
      let sessionId = chatSessionId;

      // 첫 메시지인 경우 세션 시작
      if (sessionId === null) {
        try {
          sessionId = await initializeChatSession(currentInput);
          setChatSessionId(sessionId); // 세션 ID 저장
        } catch (sessionError) {
          // 세션 생성 실패 시 에러 메시지 표시하고 종료
          const sessionAxiosError = sessionError as {
            response?: { status?: number; data?: { detail?: string } };
            message?: string;
          };

          let sessionErrorContent = "채팅 세션을 시작할 수 없습니다.";

          if (sessionAxiosError.response?.status === 404) {
            sessionErrorContent =
              "채팅 API 엔드포인트를 찾을 수 없습니다 (404).\n\n가능한 원인:\n- 서버가 실행 중이 아닐 수 있습니다\n- API 엔드포인트 경로가 변경되었을 수 있습니다\n- 네트워크 연결을 확인해주세요";
          } else if (
            sessionAxiosError.response?.status === 401 ||
            sessionAxiosError.response?.status === 403
          ) {
            sessionErrorContent =
              "인증이 필요합니다. 페이지를 새로고침하거나 다시 로그인해주세요.";
          } else if (sessionAxiosError.message) {
            sessionErrorContent = `세션 생성 실패: ${sessionAxiosError.message}`;
          }

          // 에러 메시지로 assistant 메시지 업데이트
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: sessionErrorContent,
              };
            }
            return updated;
          });
          setIsSending(false);
          return; // 세션 생성 실패 시 여기서 종료
        }
      } else {
        // 기존 세션에 메시지 전송
        await sendMessage(sessionId, {
          content_md: currentInput,
        });
      }

      // 이전 스트림이 있으면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let streamedContent = "";
      setIsStreaming(true);

      // 타임아웃 설정: 3초 동안 새로운 데이터가 오지 않으면 자동 완료 처리
      let timeoutId: NodeJS.Timeout | null = null;
      const resetTimeout = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          // 타임아웃 발생 시 강제로 완료 처리
          console.log("스트리밍 타임아웃 - 자동 완료 처리");
          setIsStreaming(false);
          setIsSending(false);
          abortControllerRef.current = null;

          // 최종 파싱 및 업데이트
          const parsed = parseStreamResponse(streamedContent);
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: parsed.formattedContent || streamedContent,
              };
            }
            return updated;
          });
          setCanCreateTask(parsed.canCreateTask ?? true);

          setTimeout(() => {
            textareaRef.current?.focus();
          }, 100);
        }, 3000); // 3초 타임아웃
      };

      // 초기 타임아웃 시작
      resetTimeout();

      // 스트리밍 응답 처리
      await getStream(
        sessionId,
        (data: string) => {
          resetTimeout(); // 새로운 데이터가 올 때마다 타임아웃 리셋

          // 각 data 라인이 완전한 JSON인지 확인
          let isCompleteJson = false;
          try {
            JSON.parse(data);
            isCompleteJson = true;
          } catch {
            // 완전한 JSON이 아님
          }

          if (isCompleteJson) {
            // 완전한 JSON이면 이것을 사용 (이전 내용 덮어쓰기)
            streamedContent = data;
          } else {
            // 완전한 JSON이 아니면 누적 (점진적 스트리밍)
            streamedContent += data;
          }

          // 실시간으로 메시지 업데이트 (포맷팅 시도, 실패 시 원본 표시)
          const formatted = formatMessage(streamedContent);
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content:
                  formatted !== streamedContent ? formatted : streamedContent,
              };
            }
            return updated;
          });
        },
        (error: Error) => {
          // 타임아웃 취소
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          // AbortError는 정상적인 취소이므로 무시
          if (error.name === "AbortError") {
            console.log("스트리밍 취소됨");
            return;
          }

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
          // 에러 발생 시 입력창 활성화
          setIsSending(false);
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        () => {
          // 타임아웃 취소
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          // 스트리밍 완료 - 먼저 스트리밍 상태를 false로 설정
          setIsStreaming(false);

          // 스트리밍 완료 후 파싱 (메시지는 이미 스트리밍 중에 업데이트되었으므로 최종 파싱만 수행)
          const parsed = parseStreamResponse(streamedContent);

          // 최종 메시지 업데이트 (포맷팅된 내용이 있는 경우에만)
          if (
            parsed.formattedContent &&
            parsed.formattedContent !== streamedContent
          ) {
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[assistantMessageIndex]) {
                updated[assistantMessageIndex] = {
                  ...updated[assistantMessageIndex],
                  content: parsed.formattedContent || streamedContent,
                };
              }
              return updated;
            });
          }

          // 선택 옵션 기능 제거 - 항상 입력창 활성화
          setCanCreateTask(parsed.canCreateTask ?? true);
          setIsSending(false);
          abortControllerRef.current = null;

          // 입력창에 자동 포커스
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 100);
        },
        abortController.signal,
      );
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setIsStreaming(false);
      abortControllerRef.current = null;

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

      if (axiosError.response?.status === 404) {
        errorContent =
          "채팅 API 엔드포인트를 찾을 수 없습니다 (404).\n\n가능한 원인:\n- 서버가 실행 중이 아닐 수 있습니다\n- API 엔드포인트 경로가 변경되었을 수 있습니다\n- 네트워크 연결을 확인해주세요";
      } else if (axiosError.response?.status === 403) {
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
      setIsStreaming(false);
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
    setCanCreateTask(false);
    setIsStreaming(false);
    onClose();
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
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const isAssistant = message.role === "assistant";
              const isLastMessage = index === messages.length - 1;
              const hasContent =
                message.content && message.content.trim().length > 0;
              const isEmptyOrLoading =
                isAssistant &&
                isLastMessage &&
                !hasContent &&
                (isSending || isStreaming);
              // 스트리밍 중이면 무조건 "응답 생성 중..." 표시
              const isStreamingMessage =
                isAssistant && isLastMessage && isStreaming;

              return (
                <div key={index}>
                  <div
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-lg ${
                        isUser
                          ? "bg-[#7871FE] text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {isEmptyOrLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            생각 중...
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className="inline-block w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></span>
                            <span
                              className="inline-block w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="inline-block w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {isStreamingMessage && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                              <span>응답 생성 중...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 스크롤 앵커 */}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="w-full min-h-[100px] resize-none pr-16 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isSending) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={isSending}
                className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 focus:outline-none focus-visible:outline-none"
              >
                <Send className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 버튼 영역 */}
            {messages.length > 0 && (
              <div className="flex gap-3 items-center justify-end">
                {/* Task 생성하기 버튼 */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canCreateTask}
                  className="px-6 font-semibold text-white bg-black hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
