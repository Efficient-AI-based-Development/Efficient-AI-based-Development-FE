import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function SettingPage3() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"PRD" | "UserStory" | "SRS">("PRD");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

    // AI 응답 시뮬레이션 
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `${activeTab}에 대한 수정 요청을 반영하여 업데이트하겠습니다. 추가로 수정이 필요한 부분이 있으시면 말씀해 주세요.`,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsSubmitting(false);
    }, 1000);
  };

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if ((messages.length > 0 || isSubmitting) && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSubmitting]);

  const handleComplete = () => {
    navigate({ 
      to: "/document/check",
    });
  };

  return (
    <div className="bg-white min-h-screen p-8 px-16">
      <div className="mx-auto mt-4">
        {/* 진행 바 */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-start items-center gap-4">
            <button 
              onClick={() => navigate({ to: "/document/setting2" })}
              className="text-gray-400 hover:text-gray-600 text-3xl"
            >
              &lt;
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-medium text-gray-600">
                PRD / UserStory / SRS 생성 및 수정
              </div>
              <div className="h-2 bg-[#D9D9D9] rounded-full overflow-hidden relative w-[500px]">
                <div
                  className="h-full bg-[#7871FE] rounded-full transition-all"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setActiveTab("PRD")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "PRD"
                  ? "bg-gray-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              PRD
            </button>
            <button
              onClick={() => setActiveTab("UserStory")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "UserStory"
                  ? "bg-gray-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              UserStory
            </button>
            <button
              onClick={() => setActiveTab("SRS")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "SRS"
                  ? "bg-gray-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              SRS
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex gap-6 h-[calc(100vh-300px)]">
          {/* 왼쪽 패널 - 문서 표시 영역 */}
          <div className="flex-1 bg-[#7871FE]/15 rounded-2xl p-8 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="text-gray-700 space-y-4">
                <h2 className="text-2xl font-bold mb-4">{activeTab} 문서</h2>
                <div className="prose max-w-none">
                  <p className="text-base leading-relaxed">
                    {activeTab} 문서 내용이 여기에 표시됩니다. 생성된 문서의 전체 내용을 확인할 수 있습니다.
                  </p>
                  <p className="text-base leading-relaxed mt-4">
                    수정이 필요한 부분이 있다면 오른쪽 패널에서 수정 요청을 입력해 주세요.
                  </p>
                </div>
              </div>
            </div>
            {/* 완료 버튼 - 하단 고정 */}
            <div className="flex justify-end mt-4 pt-4">
              <button 
                onClick={handleComplete}
                className="px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                완료
              </button>
            </div>
          </div>

          {/* 오른쪽 패널 - 채팅 영역 */}
          <div className="w-[500px] flex flex-col border-2 border-[#7871FE] rounded-2xl bg-white overflow-hidden">
            {/* 상단 안내 텍스트 - 메시지가 없을 때만 표시 */}
            {messages.length === 0 && (
              <div className="p-6 flex-shrink-0">
                <p className="text-gray-600 font-medium">
                  {activeTab}에 대한 수정 요청이 있다면 입력해 주세요.
                </p>
              </div>
            )}

            {/* 채팅 메시지 영역 */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start ml-4"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                      msg.sender === "user"
                        ? "bg-[#7871FE] text-white font-semibold"
                        : "bg-[#7871FE]/30 text-gray-900"
                    }`}
                  >
                    <p className="font-medium text-base leading-relaxed whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex justify-start ml-4">
                  <div className="bg-[#7871FE]/30 rounded-2xl p-4">
                    <p className="text-base text-gray-600">...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 입력 필드 */}
            <div className="p-4 flex-shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`입력해 주세요…`}
                  disabled={isSubmitting}
                  className="w-full h-[120px] resize-none rounded-[18px] bg-[#7871FE]/10 px-6 py-5 pr-16 text-base leading-relaxed
                           placeholder:text-zinc-400 placeholder:text-md
                           focus:outline-none focus:ring-2 focus:ring-[#7871FE]/40 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                {/* 우측 전송 버튼 */}
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
      </div>
    </div>
  );
}

