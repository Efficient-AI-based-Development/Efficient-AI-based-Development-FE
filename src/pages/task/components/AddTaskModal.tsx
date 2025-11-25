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

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TaskType;
    priority: number;
    message: string;
  }) => void;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가되면 스크롤을 맨 아래로
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AI API 호출 함수 (나중에 실제 API로 교체)
  const callAIAPI = async (userInput: string) => {
    // TODO: 실제 AI API 호출로 교체 필요
    // const response = await fetch('/api/ai/chat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         message: userInput,
    //         type: selectedType,
    //         priority: priority,
    //         conversationHistory: messages
    //     })
    // });
    // const data = await response.json();
    // return data;

    // === MOCK 데이터 (개발용) ===
    return new Promise<{
      content: string;
      options?: string[];
      canCreateTask?: boolean;
    }>((resolve) => {
      setTimeout(() => {
        // 로그인 관련 키워드가 있으면 선택지 제공
        const hasLoginKeyword =
          userInput.includes("로그인") || userInput.includes("login");

        if (hasLoginKeyword) {
          resolve({
            content: `좋아요! 로그인 기능에는 다양한 하위 항목이 있어요\n어떤 부분을 구현하고 싶으신가요?`,
            options: [
              "이메일 / 비밀번호 로그인",
              "소셜 로그인 (Google, Kakao)",
              "세션 or JWT 토큰 인증",
              "로그인 폼 UI",
            ],
            canCreateTask: false, // 아직 선택 안 함
          });
        } else {
          resolve({
            content: `${userInput}에 대한 작업을 이해했습니다. 추가 정보가 필요하시면 말씀해주세요.`,
            canCreateTask: true, // 충분한 정보가 있음
          });
        }
      }, 500);
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    // 사용자 메시지 추가
    const userMessage = { role: "user" as const, content: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue("");

    try {
      // AI API 호출
      const aiResponse = await callAIAPI(currentInput);

      const aiMessage = {
        role: "assistant" as const,
        content: aiResponse.content,
        options: aiResponse.options,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (aiResponse.options) {
        setShowOptions(true);
        setSelectedOptions([]);
      }

      // AI가 충분한 정보를 얻었다고 판단하면 Task 생성 가능
      setCanCreateTask(aiResponse.canCreateTask ?? false);
    } catch {
      // 에러 처리
      const errorMessage = {
        role: "assistant" as const,
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
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

  const handleContinueChat = () => {
    if (selectedOptions.length === 0) return;

    const selectedText = `다음 항목들을 선택했습니다:\n${selectedOptions.map((o) => `- ${o}`).join("\n")}`;
    const userMessage = { role: "user" as const, content: selectedText };
    setMessages((prev) => [...prev, userMessage]);

    setIsSending(true);
    setShowOptions(false);

    // AI 응답
    setTimeout(() => {
      const aiMessage = {
        role: "assistant" as const,
        content: `알겠습니다! 선택하신 ${selectedOptions.length}개 항목으로 작업을 진행하겠습니다.`,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsSending(false);
      setCanCreateTask(true); // 선택 완료 후 Task 생성 가능
    }, 500);
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
