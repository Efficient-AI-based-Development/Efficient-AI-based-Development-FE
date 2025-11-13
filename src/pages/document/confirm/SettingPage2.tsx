import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function SettingPage2() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/document/setting2" });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  // SettingPage1에서 전달받은 설정 정보를 AI 메시지로 변환
  useEffect(() => {
    if (search && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const {
        projectName,
        mainColor,
        pageCount,
        featureCount,
        aiModel,
        techStack,
      } = search;

      if (projectName || pageCount || featureCount || aiModel || techStack) {
        const settingsText = `지금까지 알려주신 내용은 다음과 같습니다:

1. 프로젝트 이름: ${projectName || "-"}
2. 메인 컬러: ${mainColor || "-"}
3. 페이지 수: ${pageCount || "-"}
4. 구현할 기능 수: ${featureCount || "-"}
5. AI 모델: ${aiModel || "-"}
6. 기술 스택: ${techStack ? techStack.split(",").join(", ") : "-"}

추가 수정사항이 있다면 말씀해주시고, 수정이 완료되면 다음으로 버튼을 눌러주세요.`;

        const initialMessage: Message = {
          id: "initial",
          text: settingsText,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }
    }
  }, [search]);

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
    navigate({ 
      to: "/document/setting3",
    });
  };

  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden p-8 px-16">
      {/* 진행 바 섹션 - 상단 고정 */}
      <div className="flex-shrink-0 pt-4 pb-4">
        <div className="flex justify-start items-center gap-4">
          <button 
            onClick={() => navigate({ to: "/document/setting1" })}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
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
        </div>
      </div>

      {/* 채팅 메시지 영역 - 스크롤 가능 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mt-4 mb-4">
        {/* 채팅 메시지 */}
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="bg-[#7871FE]/30 rounded-2xl p-8 border border-[#7871FE]/30 ml-8">
              <p className="font-semibold text-lg leading-relaxed">
                입력해주신 내용을 바탕으로 PRD와 UserStory, SRS를 작성해봤어요!
              </p>
              <p className="font-semibold text-lg leading-relaxed">
                확인 전, 수정이 필요한 부분이 있다면 수정해 주세요.
              </p>
              <p className="font-semibold text-lg leading-relaxed">
                수정이 완료되면 '다음으로' 버튼을 눌러주세요.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isFirstMessage = msg.id === "initial";
            return (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start ml-8"}`}
              >
                <div
                  className={`${isFirstMessage ? "max-w-full" : "max-w-[70%]"} rounded-2xl ${
                    isFirstMessage ? "p-8" : "px-6 py-4"
                  } ${
                    msg.sender === "user"
                      ? "bg-[#7871FE] text-white font-semibold"
                      : "bg-[#7871FE]/30 text-gray-900"
                  } ${
                    isFirstMessage ? "border border-[#7871FE]/30" : ""
                  }`}
                >
                  <p className={`${isFirstMessage ? "font-semibold text-lg" : "font-medium text-base"} leading-relaxed whitespace-pre-line`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
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
              className="w-full h-[138px] resize-none rounded-[18px] bg-[#7871FE]/10 px-6 py-5 pr-16 text-[18px] leading-relaxed
                       placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-[#7871FE]/40 disabled:opacity-50"
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

