import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { sendMessage, getStream, getChatDocuments, storeFile } from "@/pages/task/services/chatService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isChatMessage?: boolean; // true이면 회색 채팅 메시지
}

export default function SettingPage2() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/document/setting2" });

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const firstStreamSkipped = useRef(false);
  const streamCleanupRef = useRef<(() => void) | null>(null);

  /* 초기 세팅 */
  useEffect(() => {
    if (search && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      const { chatSessionId, projectName, pageCount, featureCount, aiModel, techStack } = search;

      if (!chatSessionId) {
        console.error("❌ chatSessionId 없음");
        window.alert("채팅 세션이 없습니다. 처음부터 다시 시작해주세요.");
        return;
      }

      const settingsText = `지금까지 알려주신 내용은 다음과 같습니다:

1. 프로젝트 이름: ${projectName || "-"}
2. 페이지 수: ${pageCount || "-"}
3. 구현할 기능 수: ${featureCount || "-"}
4. AI 모델: ${aiModel || "-"}
5. 기술 스택: ${techStack ? techStack.split(",").join(", ") : "-"}

추가 수정사항이 있다면 말씀해주시고, 수정이 완료되면 다음으로 버튼을 눌러주세요.`;

      setMessages([
        {
          id: "initial",
          text: settingsText,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [search]);

  /* 메시지 입력 시 자동 스크롤 */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  /* 메시지 전송 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { chatSessionId } = search;

    if (!message.trim() || isSubmitting || !chatSessionId) return;

    // 기존 SSE 연결 중단
    if (streamCleanupRef.current) {
      console.log("🛑 기존 SSE 스트림 중단");
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }

    const chatSessionIdStr = String(chatSessionId);

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

    // 첫 스트림 메시지 스킵 플래그 초기화
    firstStreamSkipped.current = false;

    try {
      console.log("💬 메시지 전송 시작");
      await sendMessage(chatSessionIdStr, { content_md: currentMessage });
      console.log("✅ 메시지 전송 완료");

      // Assistant placeholder (프로젝트 정보/요약/제안사항용)
      let assistantInfoText = "";
      let assistantChatText = ""; // 메시지 영역 (회색 채팅용)
      const assistantInfoMessageId = (Date.now() + 1).toString();
      const assistantChatMessageId = (Date.now() + 2).toString();

      // 두 개의 placeholder 메시지 생성
      setMessages((prev) => [
        ...prev,
        {
          id: assistantInfoMessageId,
          text: "...",
          sender: "assistant",
          timestamp: new Date(),
        },
        {
          id: assistantChatMessageId,
          text: "...",
          sender: "assistant",
          timestamp: new Date(),
          isChatMessage: true, // 회색 채팅 메시지로 표시
        },
      ]);

      // SSE 연결
      console.log("💬 SSE 연결 시작");

      const cleanup = await getStream(
        chatSessionIdStr,
        (data) => {
          // 🔥 스트림이 시작되면 입력 가능하게 하기
          setIsSubmitting(false);
          
          console.log("📨 받은 스트림 데이터:", data);

          // 첫 번째 메시지 스킵 (보통 연결 확인 메시지)
          if (!firstStreamSkipped.current) {
            firstStreamSkipped.current = true;
            // 빈 데이터나 단순 연결 확인 메시지만 스킵
            if (!data || data.trim().length === 0 || data === "connected" || data === "{}") {
              console.log("🔵 첫 SSE 메시지 스킵 (연결 확인):", data);
              return;
            }
            // 실제 데이터면 처리 계속
            console.log("🔵 첫 메시지지만 데이터 포함, 처리합니다:", data);
          }

          // 종료 신호 (더 정확한 체크)
          const trimmedData = data.trim();
          if (
            trimmedData === "[done]" ||
            trimmedData.toLowerCase() === "done" ||
            trimmedData.toLowerCase() === "[done]"
          ) {
            console.log("🔚 종료 신호 감지:", data);
            return;
          }

          // 데이터 처리
          try {
            const parsed = JSON.parse(data);

            // JSON 파싱 성공 시 처리
            if (parsed.type === "data" && parsed.doc && parsed.message) {
              const doc = parsed.doc;
              const msg = parsed.message;

              // 프로젝트 정보/요약/제안사항 (첫 번째 메시지)
              const infoText = `
🟣 프로젝트 정보
- 프로젝트명: ${doc.project_name || "-"}
- 메인 컬러: ${doc.main_color || "-"}
- 페이지 수: ${doc.page_count || "-"}
- 기능 수: ${doc.feature_count || "-"}
- AI 모델: ${doc.ai_model || "-"}
- 기술 스택: ${(doc.tech_stack || []).join(", ") || "-"}

🟣 요약
${msg.summary || "-"}

🟣 제안사항
${(msg.suggestions || [])?.map((s: string) => `- ${s}`).join("\n") || "-"}
              `.trim();

              // 메시지 영역 (두 번째 메시지 - 회색 채팅용)
              const chatText = msg.message || "";

              // 두 메시지 모두 업데이트
              if (infoText) {
                assistantInfoText = infoText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantInfoMessageId
                      ? { ...m, text: assistantInfoText }
                      : m
                  )
                );
              }

              if (chatText) {
                assistantChatText = chatText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantChatMessageId
                      ? { ...m, text: assistantChatText }
                      : m
                  )
                );
              }

              // processedText는 더 이상 사용하지 않음 (return으로 처리 완료)
              return;
            } else if (parsed.message) {
              // message 필드가 문자열인 경우 - 채팅 메시지로만 처리
              const chatText = typeof parsed.message === "string" 
                ? parsed.message 
                : JSON.stringify(parsed.message);
              
              assistantChatText += chatText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantChatMessageId
                    ? { ...m, text: assistantChatText || "처리 중...", isChatMessage: true }
                    : m
                )
              );
              return;
            } else if (parsed.text) {
              // text 필드가 있는 경우 - 채팅 메시지로만 처리
              assistantChatText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantChatMessageId
                    ? { ...m, text: assistantChatText || "처리 중...", isChatMessage: true }
                    : m
                )
              );
              return;
            } else {
              // 다른 형식의 메시지 - 채팅 메시지로 처리
              const chatText = JSON.stringify(parsed, null, 2);
              assistantChatText += chatText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantChatMessageId
                    ? { ...m, text: assistantChatText || "처리 중...", isChatMessage: true }
                    : m
                )
              );
              return;
            }
          } catch (parseError) {
            // JSON 파싱 실패 시 원본 데이터를 채팅 메시지로 처리
            console.warn("⚠️ JSON 파싱 실패, 원본 데이터 사용:", data);
            assistantChatText += data;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantChatMessageId
                  ? { ...m, text: assistantChatText || "처리 중..." }
                  : m
              )
            );
          }
        },
        (error) => {
          console.error("❌ SSE error:", error);
          setIsSubmitting(false);
          streamCleanupRef.current = null;
        },
        async () => {
          console.log("🔚 SSE 종료 → 문서 조회 시작");
          
          // 스트림 완료 후 cleanup ref 정리
          streamCleanupRef.current = null;
          
          // 스트림 완료 후 바로 입력 가능하도록 설정
          setIsSubmitting(false);

          // 문서 조회는 백그라운드에서 수행 (실패해도 계속 대화 가능)
          try {
            const docs = await getChatDocuments(chatSessionIdStr);

            const docsText = `\n\n📄 문서 정보:

## PRD
${docs.prd || "-"}

## User Story
${docs.user_story || "-"}

## SRS
${docs.srs || "-"}`;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantInfoMessageId
                  ? { ...m, text: assistantInfoText + docsText }
                  : m
              )
            );
          } catch (err) {
            console.error("문서 조회 실패 (계속 대화 가능):", err);
            // 문서 조회 실패해도 메시지는 그대로 유지
          }
        }
      );
      
      // cleanup 함수를 ref에 저장
      streamCleanupRef.current = cleanup;
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
      setIsSubmitting(false);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  };

  /* 다음으로 */
  const handleConfirm = async () => {
    // 🔥 페이지 이동 전에 SSE 강제 종료
    if (streamCleanupRef.current) {
      console.log("🛑 [SettingPage2] 페이지 이동 - SSE 강제 종료");
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }
    
    const { projectId, chatSessionId } = search || {};

    if (chatSessionId && projectId) {
      try {
        await storeFile(String(chatSessionId), {
          project_id: Number(projectId),
        });
      } catch (err) {
        window.alert("문서 저장 실패. 계속 진행할까요?");
      }
    }

    navigate({
      to: "/document/setting3",
      search: {
        chatSessionId,
        projectId,
      },
    });
  };

  /* 렌더 */
  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden p-8 px-16">
      {/* 상단 진행바 */}
      <div className="flex-shrink-0 pt-4 pb-4">
        <div className="flex items-center gap-4">
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
            <div className="h-2 bg-[#D9D9D9] w-[500px] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7871FE] rounded-full transition-all"
                style={{ width: "38%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => {
          const isInitial = msg.id === "initial";
          const isChatMessage = msg.isChatMessage === true;
          const isEmptyMessage = msg.text === "..." || msg.text.trim() === "";
          
          // 빈 메시지는 렌더링하지 않음
          if (isEmptyMessage && !isInitial) {
            return null;
          }
          
          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } ${isInitial ? "mt-20 ml-8" : msg.sender === "assistant" ? "ml-8" : ""}`}
            >
              <div
                className={`${isInitial ? "max-w-full p-8 border" : "max-w-[70%] px-6 py-4"}
                rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-[#7871FE] text-white"
                    : isChatMessage
                    ? "bg-gray-200 text-gray-900" // 회색 채팅 메시지
                    : "bg-[#7871FE]/30 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text.split("\n").map((line, i) => {
                    if (line.trim().startsWith("🟣"))
                      return (
                        <p key={i} className="text-xl font-semibold mt-4 mb-2">
                          {line}
                        </p>
                      );
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 입력 영역 */}
      <div className="flex-shrink-0 pt-4 pb-8 bg-white">
        <div className="flex justify-center mb-6">
          <button
            onClick={handleConfirm}
            className="px-8 py-4 rounded-full border-2 border-[#7871FE] bg-white font-semibold hover:bg-[#7871FE]/10"
          >
            다음으로
          </button>
        </div>

        <div className="relative w-full max-w-[1000px] mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="수정 요청을 입력해 주세요…"
              disabled={isSubmitting}
              className="w-full h-[138px] resize-none rounded-[18px] bg-[#7871FE]/10 px-6 py-5 pr-16
                placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#7871FE]/40 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="absolute right-5 bottom-5 h-10 w-10 rounded-full border bg-white flex items-center justify-center shadow hover:bg-zinc-50 active:scale-95 disabled:opacity-50"
            >
              <ArrowUp size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}