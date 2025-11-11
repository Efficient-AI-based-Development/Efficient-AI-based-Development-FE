import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function SettingPage2() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if ((messages.length > 0 || isSubmitting) && chatContainerRef.current) {
      // 채팅 컨테이너의 스크롤을 맨 아래로
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSubmitting(true);

    //AI 응답
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "수정 요청을 반영하여 PRD를 업데이트하겠습니다. 추가로 수정이 필요한 부분이 있으시면 말씀해 주세요.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleConfirm = () => {
    navigate({ to: "/document/setting3" as any });
  };

  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden p-8 px-16">
      {/* 진행 바 섹션 - 상단 고정 */}
      <div className="flex-shrink-0 pt-4 pb-4">
        <div className="flex justify-start items-center gap-4">
          <button className="text-gray-400 hover:text-gray-600 text-3xl">
            &lt;
          </button>
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-medium text-gray-700">
              PRD / UserStory / SRS 생성 및 수정
            </div>
            <div className="h-2 bg-[#D9D9D9] rounded-full overflow-hidden relative w-[500px]">
              <div
                className="h-full bg-[#7871FE] rounded-full transition-all"
                style={{ width: "38%" }}
              />
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-3xl">
            &gt;
          </button>
        </div>
      </div>

      {/* 채팅 메시지 영역 - 스크롤 가능 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mt-4 mb-4">
        {/* 초기 안내 메시지 */}
        <div className="flex justify-start">
          <div className="bg-[#7871FE]/30 rounded-2xl p-8 border border-[#7871FE]/30 ml-8">
            <p className="font-semibold text-lg leading-relaxed">
              입력해주신 내용을 바탕으로 PRD와 UserStory, SRS를 작성해봤어요!
            </p>
            <p className="font-semibold text-lg leading-relaxed">
              이어지는 내용을 보고 수정이 필요한 부분이 있다면 수정해 주세요.
            </p>
            <p className="font-semibold text-lg leading-relaxed">
              수정이 완료되면 '다음으로' 버튼을 눌러주세요.
            </p>
          </div>
        </div>

        {/* 채팅 메시지 */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start ml-8"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                msg.sender === "user"
                  ? "bg-[#7871FE] text-white font-semibold"
                  : "bg-[#7871FE]/30 text-gray-900 font-medium"
              }`}
            >
              <p className="text-base leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isSubmitting && (
          <div className="flex justify-start ml-8">
            <div className="bg-[#7871FE]/30 rounded-2xl p-4">
              <p className="text-base text-gray-600">...</p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 영역 */}
      <div className="flex-shrink-0 pt-4 pb-8 bg-white">
        {/* 다음으로 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleConfirm}
            className="px-8 py-4 rounded-full border-2 border-[#7871FE] bg-white text-black font-semibold text-lg hover:bg-[#7871FE]/10 transition-colors"
          >
            다음으로
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="relative w-full max-w-[1000px] mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="수정 요청을 입력해 주세요…"
              disabled={isSubmitting}
              className="w-full h-[138px] resize-none rounded-[18px] border border-[#7871FE] bg-white px-6 py-5 pr-16 text-[18px] leading-relaxed
                       placeholder:text-zinc-400 shadow-[0_8px_24px_rgba(15,23,42,0.06)]
                       focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {/* 우측 둥근 전송 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              aria-label="전송"
              className="absolute right-5 bottom-5 inline-flex h-10 w-10 items-center justify-center rounded-full
                       border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]
                       hover:bg-zinc-50 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

