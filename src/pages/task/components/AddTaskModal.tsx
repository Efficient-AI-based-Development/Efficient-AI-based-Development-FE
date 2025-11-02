import { useState } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // 사용자 메시지 추가
    const userMessage = { role: "user" as const, content: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    // TODO: 여기서 AI API 호출하여 응답 받기
    // 임시로 간단한 응답 추가
    setTimeout(() => {
      const aiMessage = {
        role: "assistant" as const,
        content: `${inputValue}에 대한 작업을 이해했습니다. 추가 정보가 필요하시면 말씀해주세요.`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);

    setInputValue("");
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
    onClose();
  };

  const getTypeButtonStyle = (type: TaskType) => {
    const baseStyle =
      "px-4 py-2 rounded-full text-sm font-semibold transition-colors";
    const isSelected = selectedType === type;

    switch (type) {
      case "DEV":
        return `${baseStyle} ${isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;
      case "DESIGN":
        return `${baseStyle} ${isSelected ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;
      case "DOCS":
        return `${baseStyle} ${isSelected ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;
      default:
        return baseStyle;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white">
        {/* 헤더 */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Task 추가하기
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            ></button>
          </div>
        </DialogHeader>

        {/* 컨텐츠 */}
        <div className="px-6 py-4 space-y-6">
          {/* 태그 선택과 중요도를 하나의 박스에 */}
          <div className="border border-primary/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* 태그 선택 */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  태그
                </span>
                <button
                  onClick={() => setSelectedType("DEV")}
                  className={getTypeButtonStyle("DEV")}
                >
                  DEV#1
                </button>
                <button
                  onClick={() => setSelectedType("DESIGN")}
                  className={getTypeButtonStyle("DESIGN")}
                >
                  DESIGN#1
                </button>
                <button
                  onClick={() => setSelectedType("DOCS")}
                  className={getTypeButtonStyle("DOCS")}
                >
                  DOCS#1
                </button>
              </div>

              {/* 중요도 */}
              <div className="flex items-center gap-4 min-w-[250px]">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  중요도
                </span>
                <Slider
                  value={[priority]}
                  onValueChange={(value) => setPriority(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-gray-100 rounded-[4px] p-4 w-[70%]">
            <p className="text-sm text-gray-700 leading-relaxed">
              좋아요! 새로운 작업이군요! 상단의 태그와 중요도를 설정한 후,
              새롭게 추가하고 싶은 기능을 설명해주세요
              <br />
              ex) 로그인 기능을 추가하고 싶어
            </p>
          </div>

          {/* 채팅 영역 */}
          <div className="space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 입력창 */}
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="w-full min-h-[120px] resize-none pr-16"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Send className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 완료 버튼 */}
          {messages.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit} className="px-6">
                Task 생성하기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
