import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { sendMessage, getStream, getChatDocuments } from "@/pages/task/services/chatService";

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
  const streamAbortControllerRef = useRef<AbortController | null>(null);

  // SettingPage1에서 전달받은 정보 확인
  useEffect(() => {
    if (search && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const { chatSessionId, projectId, projectName, pageCount, featureCount, aiModel, techStack } = search;

      // chatSessionId 확인
      if (!chatSessionId) {
        console.error("❌ [SettingPage2] chatSessionId가 없습니다.");
        window.alert("채팅 세션이 없습니다. 처음부터 다시 시작해주세요.");
        return;
      }

      // 초기 안내 메시지 표시
      const settingsText = `지금까지 알려주신 내용은 다음과 같습니다:

1. 프로젝트 이름: ${projectName || "-"}
2. 페이지 수: ${pageCount || "-"}
3. 구현할 기능 수: ${featureCount || "-"}
4. AI 모델: ${aiModel || "-"}
5. 기술 스택: ${techStack ? techStack.split(",").join(", ") : "-"}

추가 수정사항이 있다면 말씀해주시고, 수정이 완료되면 다음으로 버튼을 눌러주세요.`;

      const initialMessage: Message = {
        id: "initial",
        text: settingsText,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
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
    const { chatSessionId } = search;
    
    if (!message.trim() || isSubmitting || !chatSessionId) {
      if (!chatSessionId) {
        console.error("❌ [SettingPage2] chatSessionId가 없습니다.");
        window.alert("채팅 세션이 없습니다. 처음부터 다시 시작해주세요.");
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsSubmitting(true);

    try {
      const chatSessionIdStr = chatSessionId as string;
      
      // ① Assistant 메시지 생성 (스트리밍으로 업데이트될 예정)
      let assistantMessageText = "";
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        text: "",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // ② 먼저 메시지 전송 (백엔드가 메시지를 받아야 작업 시작)
      console.log("💬 [SettingPage2] 메시지 전송 시작");
      await sendMessage(chatSessionIdStr, {
        content_md: currentMessage,
      });
      console.log("✅ [SettingPage2] 메시지 전송 완료");

      // ③ 그 다음 SSE 스트리밍 시작 (await 없이 비동기 실행)
      console.log("💬 [SettingPage2] SSE 스트리밍 연결 시작, chatSessionId:", chatSessionIdStr);
      getStream(
        chatSessionIdStr,
        (data) => {
          console.log("📥 [SettingPage2] onMessage 호출됨, data:", data);
          
          // 빈 메시지 무시
          if (!data || data.trim() === "") {
            console.log("⚠️ [SettingPage2] 빈 메시지 무시");
            return;
          }

          // 종료 이벤트 처리 (다양한 종료 신호 감지)
          const lowerData = data.toLowerCase();
          if (
            data === "[DONE]" ||
            data.trim() === "[DONE]" ||
            lowerData.includes("done") ||
            lowerData.includes("end") ||
            lowerData.includes("finish") ||
            lowerData.includes("[end]") ||
            lowerData.includes("[finish]")
          ) {
            console.log("✅ [SettingPage2] 스트리밍 종료 이벤트 수신:", data);
            // 종료 신호는 onComplete에서 처리하므로 여기서는 무시
            return;
          }

          // JSON 파싱 시도
          let parsed;
          try {
            parsed = JSON.parse(data);
            console.log("✅ [SettingPage2] JSON 파싱 성공:", parsed);
          } catch (e) {
            // JSON 파싱 실패 시 무시 (점, 공백 등 keep-alive chunk)
            console.warn("⚠️ [SettingPage2] 파싱 실패한 chunk (무시):", data, e);
            return;
          }

          // 본문 텍스트가 있는 chunk만 UI에 반영
          let text = "";

          // message가 문자열이면 그대로
          if (typeof parsed.message === "string") {
            text = parsed.message;
          }
          // message가 객체면 → JSON 문자열로 변환
          else if (typeof parsed.message === "object" && parsed.message !== null) {
            text = JSON.stringify(parsed.message, null, 2);
          }
          // content가 문자열이면
          else if (typeof parsed.content === "string") {
            text = parsed.content;
          }
          // title이 문자열이면
          else if (typeof parsed.title === "string") {
            text = parsed.title;
          }
          // fallback: 전체를 문자열로 변환
          else {
            text = JSON.stringify(parsed);
          }
          
          if (typeof text === "string" && text.trim() !== "") {
            assistantMessageText += text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, text: assistantMessageText }
                  : msg
              )
            );
          }
          
        },
        (error) => {
          console.error("❌ [SettingPage2] 스트리밍 에러:", error);
          setIsSubmitting(false);
        },
        async () => {
          console.log("✅ [SettingPage2] 스트리밍 완료, 문서 조회 시작");
          setIsSubmitting(false);
          
          // SSE 종료 후 문서 조회
          try {
            const documents = await getChatDocuments(chatSessionIdStr);
            console.log("✅ [SettingPage2] 문서 조회 성공:", documents);
            
            // 문서를 메시지로 표시
            if (documents.prd || documents.user_story || documents.srs) {
              const documentsText = `문서 생성이 완료되었습니다.

## PRD (Product Requirements Document)
${documents.prd || "-"}

## User Story
${documents.user_story || "-"}

## SRS (Software Requirements Specification)
${documents.srs || "-"}

추가 수정사항이 있다면 말씀해주시고, 수정이 완료되면 다음으로 버튼을 눌러주세요.`;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, text: assistantMessageText + "\n\n" + documentsText }
                    : msg
                )
              );
            }
          } catch (error) {
            console.error("❌ [SettingPage2] 문서 조회 실패:", error);
            // 문서 조회 실패해도 스트리밍 메시지는 유지
          }
        }
      );
      console.log("✅ [SettingPage2] SSE 연결 시작됨 (비동기 실행 중)");
    } catch (error) {
      console.error("❌ [SettingPage2] 메시지 전송 실패:", error);
      setIsSubmitting(false);
      
      // 에러 메시지 표시
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
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
            <div className="text-xl font-semibold text-gray-700">
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {/* 채팅 메시지 */}
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="bg-[#7871FE]/30 rounded-2xl p-8 border border-[#7871FE]/30 mt-20 ml-8">
              <p className="font-semibold leading-relaxed">
                입력해주신 내용을 바탕으로 PRD와 UserStory, SRS를 작성해봤어요!
              </p>
              <p className="font-semibold leading-relaxed">
                확인 전, 수정이 필요한 부분이 있다면 수정해 주세요.
              </p>
              <p className="font-semibold leading-relaxed">
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
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} ${isFirstMessage ? "mt-20 ml-8" : msg.sender === "assistant" ? "ml-8" : ""}`}
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
                  <p className={`${isFirstMessage ? "font-semibold" : "font-medium text-base"} leading-relaxed whitespace-pre-line`}>
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
            className="px-8 py-4 rounded-full border-2 border-[#7871FE] bg-white text-black font-semibold text-md hover:bg-[#7871FE]/10 transition-colors"
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
              className="w-full h-[138px] resize-none rounded-[18px] bg-[#7871FE]/10 px-6 py-5 pr-16 leading-relaxed
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

