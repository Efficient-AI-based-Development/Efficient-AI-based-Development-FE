import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendMessage, getStream } from "@/pages/task/services/chatService";
import { markdownComponents } from "@/pages/task/components/TaskDetailModal/markdownComponents";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function SettingPage3() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/document/setting3" });

  // ★ Setting2에서 넘어오는 값: chatSessionId, projectId
  const { chatSessionId, projectId } = search || {};

  const [activeTab, setActiveTab] = useState<"PRD" | "UserStory" | "SRS">("PRD");

  // ★ fileType state (탭에 따라 자동 동기화)
  const [fileType, setFileType] = useState<"PRD" | "UserStory" | "SRS">("PRD");

  // 🟪 State 구조 (최종)
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState({
    prd: "",
    user_story: "",
    srs: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // chatSessionId와 projectId 검증
  useEffect(() => {
    if (!chatSessionId) {
      console.error("❌ [SettingPage3] chatSessionId가 없습니다.");
      window.alert("채팅 세션이 없습니다. 처음부터 다시 시작해주세요.");
      navigate({ to: "/document/setting1" });
      return;
    }
    if (!projectId) {
      console.error("❌ [SettingPage3] projectId가 없습니다.");
      window.alert("프로젝트 ID가 없습니다. 처음부터 다시 시작해주세요.");
      navigate({ to: "/document/setting1" });
      return;
    }
    console.log("✅ [SettingPage3] 초기화 완료 - chatSessionId:", chatSessionId, "projectId:", projectId);
  }, [chatSessionId, projectId, navigate]);

  // 🟨 탭에 따라 화면에 표시할 문서만 바꿔줌
  const getCurrentDocument = () => {
    if (activeTab === "PRD") return documents.prd;
    if (activeTab === "UserStory") return documents.user_story;
    if (activeTab === "SRS") return documents.srs;
    return "";
  };

  // 탭 이름을 백엔드 파일 타입으로 변환
  const getFileTypeForBackend = (tab: "PRD" | "UserStory" | "SRS"): "PRD" | "USER_STORY" | "SRS" => {
    if (tab === "PRD") return "PRD";
    if (tab === "UserStory") return "USER_STORY";
    if (tab === "SRS") return "SRS";
    return "PRD"; // 기본값
  };

  // 🟩 메시지 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatSessionId || !projectId) {
      window.alert("채팅 세션이 없습니다. 다시 시도해주세요.");
      return;
    }
    if (!message.trim()) return;

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
      const projectIdNum = Number(projectId);
      if (isNaN(projectIdNum)) {
        throw new Error("유효하지 않은 projectId입니다.");
      }

      // assistant 메시지 placeholder 생성
      let assistantText = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, text: "", sender: "assistant", timestamp: new Date() },
      ]);

      // ① 메시지 전송 (현재 탭에 따라 파일 타입 결정)
      const backendFileType = getFileTypeForBackend(activeTab);
      console.log("💬 [SettingPage3] 메시지 전송 시작 - 파일 타입:", backendFileType);
      await sendMessage(chatSessionId, {
        content_md: currentMessage,
        project_id: projectIdNum,
        file_type: backendFileType, // 현재 탭에 따라 PRD, USER_STORY, SRS
      });
      console.log("✅ [SettingPage3] 메시지 전송 완료");

      // ② SSE 연결 (await 없이 비동기 실행)
      console.log("💬 [SettingPage3] SSE 스트리밍 연결 시작");
      getStream(
        chatSessionId,
        (chunk) => {
          console.log("📥 [SettingPage3] SSE chunk 수신:", chunk);

          if (!chunk || chunk.trim() === "") return;

          // 종료 이벤트 처리
          const lowerChunk = chunk.toLowerCase();
          if (
            chunk === "[DONE]" ||
            chunk.trim() === "[DONE]" ||
            lowerChunk.includes("done") ||
            lowerChunk.includes("end") ||
            lowerChunk.includes("finish")
          ) {
            console.log("✅ [SettingPage3] 스트리밍 종료 이벤트 수신");
            return;
          }

          // JSON 파싱 시도
          let parsed;
          try {
            parsed = JSON.parse(chunk);
            console.log("✅ [SettingPage3] JSON 파싱 성공:", parsed);
          } catch (e) {
            // JSON 파싱 실패 시 무시 (점, 공백 등 keep-alive chunk)
            console.warn("⚠️ [SettingPage3] 파싱 실패한 chunk (무시):", chunk);
            return;
          }

          // 🟦 SSE에서 내려오는 chunk 처리
          // 💬 assistant 메시지
          if (parsed.type === "message") {
            const text = parsed.text || parsed.message || "";
            if (text && text.trim() !== "") {
              assistantText += text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: assistantText } : m
                )
              );
            }
          }
          // 📝 문서 업데이트
          else if (parsed.type === "document") {
            const fileType = parsed.file_type;
            const contentMd = parsed.content_md || "";

            if (fileType === "PRD") {
              setDocuments((d) => ({ ...d, prd: contentMd }));
              console.log("📝 [SettingPage3] PRD 문서 업데이트");
            } else if (fileType === "USER_STORY" || fileType === "UserStory") {
              setDocuments((d) => ({ ...d, user_story: contentMd }));
              console.log("📝 [SettingPage3] UserStory 문서 업데이트");
            } else if (fileType === "SRS") {
              setDocuments((d) => ({ ...d, srs: contentMd }));
              console.log("📝 [SettingPage3] SRS 문서 업데이트");
            }
          }
          // 기타 이벤트 (assistant, message 등)
          else if (parsed.content || parsed.message || parsed.text) {
            const text = parsed.content || parsed.message || parsed.text || "";
            if (text && text.trim() !== "") {
              assistantText += text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: assistantText } : m
                )
              );
            }
          }
        },
        (error) => {
          console.error("❌ [SettingPage3] SSE 오류:", error);
          setIsSubmitting(false);
        },
        () => {
          console.log("✅ [SettingPage3] SSE 스트리밍 완료");
          setIsSubmitting(false);
        }
      );
    } catch (err) {
      console.error("❌ [SettingPage3] 메시지 전송 실패:", err);
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

  // 스크롤 자동 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSubmitting]);

  // 완료 버튼
  const handleComplete = () => {
    const { projectId } = search || {};
    navigate({ 
      to: "/document/check",
      search: {
        projectId: projectId || undefined,
      },
    });
  };

  return (
    <div className="bg-white min-h-screen p-8 px-16">
      <div className="mx-auto mt-4">
        {/* 진행 바 */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate({ to: "/document/setting2" })}
              className="text-gray-400 hover:text-gray-600 text-3xl"
            >
              &lt;
            </button>

            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold text-gray-600">
                PRD / UserStory / SRS 생성 및 수정
              </div>

              <div className="h-2 bg-[#D9D9D9] w-[500px] rounded-full overflow-hidden">
                <div className="h-full bg-[#7871FE] rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-3 mt-4">
            {["PRD", "UserStory", "SRS"].map((tab) => (
            <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any);
                  setFileType(tab as any); // ★ file_type 자동 동기화
                }}
                className={`px-6 py-3 rounded-3xl font-semibold ${
                  activeTab === tab
                  ? "bg-gray-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600"
              }`}
            >
                {tab}
            </button>
            ))}
          </div>
        </div>

        {/* 메인 영역 */}
        <div className="flex gap-6 h-[calc(100vh-300px)]">
          {/* 문서 표시 구역 */}
          <div className="flex-1 bg-[#7871FE]/15 rounded-2xl p-8 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {getCurrentDocument() ? (
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {getCurrentDocument()}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">
                    {activeTab} 문서가 아직 생성되지 않았습니다. 채팅으로 문서를 생성해보세요.
                  </p>
              </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={handleComplete}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                완료
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="w-[500px] flex flex-col border-2 border-[#7871FE] rounded-2xl bg-white overflow-hidden">
            {messages.length === 0 && (
              <div className="p-6">
                <p className="text-gray-600 font-medium">
                  {fileType} 문서에 대한 수정 요청을 입력해 주세요.
                </p>
              </div>
            )}

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start ml-4"}`}
                >
                  <div
                    className={`max-w-[70%] px-6 py-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-[#7871FE] text-white font-semibold"
                        : "bg-[#7871FE]/30 text-gray-900"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isSubmitting && (
                <div className="flex justify-start ml-4">
                  <div className="bg-[#7871FE]/30 rounded-2xl p-4">
                    <p className="text-gray-600">...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 입력창 */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${fileType} 수정 요청을 입력하세요…`}
                  className="w-full h-[120px] px-6 py-5 bg-[#7871FE]/10 rounded-[18px] 
                             focus:ring-2 focus:ring-[#7871FE]/40 outline-none
                             placeholder:text-zinc-400 resize-none pr-16"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="absolute right-5 bottom-5 h-10 w-10 rounded-full border bg-white shadow
                             flex items-center justify-center hover:bg-zinc-50 active:scale-95"
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
