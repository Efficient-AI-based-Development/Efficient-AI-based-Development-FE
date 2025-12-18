import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  sendMessage,
  getStream,
  createChatSession,
  storeFile,
  getLatestDocument,
} from "@/pages/task/services/chatService";
import { markdownComponents } from "@/pages/task/components/TaskDetailModal/markdownComponents";

type TabType = "PRD" | "USER_STORY" | "SRS";

interface Message {
  id: string | number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function SettingPage3() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/document/setting3" });

  const { projectId } = search || {};

  // 🔥 탭별 세션 ID
  const [chatSessions, setChatSessions] = useState<Record<TabType, number | null>>({
    PRD: null,
    USER_STORY: null,
    SRS: null,
  });

  // 🔥 탭별 문서 내용
  const [documents, setDocuments] = useState<Record<TabType, string>>({
    PRD: "",
    USER_STORY: "",
    SRS: "",
  });

  // 🔥 탭별 메시지
  const [messages, setMessages] = useState<Record<TabType, Message[]>>({
    PRD: [],
    USER_STORY: [],
    SRS: [],
  });

  const [activeTab, setActiveTab] = useState<TabType>("PRD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  const streamCleanupRef = useRef<Record<TabType, (() => void) | null>>({
    PRD: null,
    USER_STORY: null,
    SRS: null,
  });

  // 스크롤 자동 이동
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, activeTab]);

  // --------------------------------
  // 초기 세션 생성 및 문서 3개 모두 로딩
  // --------------------------------
  useEffect(() => {
    if (!projectId) {
      alert("projectId 없음");
      navigate({ to: "/document/setting1" });
      return;
    }

    const init = async () => {
      // PRD, USER_STORY, SRS 세션 생성 및 문서 로딩
      const newSessions: Record<TabType, number | null> = {
        PRD: null,
        USER_STORY: null,
        SRS: null,
      };
      
      const newDocuments: Record<TabType, string> = {
        PRD: "",
        USER_STORY: "",
        SRS: "",
      };

      // 각 탭별로 세션 생성 및 문서 가져오기
      const tabs: TabType[] = ["PRD", "USER_STORY", "SRS"];
      
      for (const tab of tabs) {
        try {
          const fileTypeForAPI = tab;
          console.log(`🔄 [SettingPage3] ${tab} 세션 생성 시작 (file_type: ${fileTypeForAPI})`);
          
          const session = await createChatSession({
            project_id: Number(projectId),
            file_type: fileTypeForAPI as any,
            content_md: "", // 필수 필드
          });

          newSessions[tab] = session.chat_id;
          console.log(`✅ [SettingPage3] ${tab} 세션 생성 완료: ${session.chat_id}`);

          // tempDocument API로 최신 문서 가져오기
          const doc = await getLatestDocument(session.chat_id);
          newDocuments[tab] = doc || "";
          console.log(`📄 [SettingPage3] ${tab} 문서 로딩 완료 (길이: ${doc.length})`);
        } catch (error) {
          console.error(`❌ [SettingPage3] ${tab} 세션 생성 실패:`, error);
        }
      }

      // 세션과 문서 모두 업데이트
      setChatSessions(newSessions);
      setDocuments(newDocuments);
      console.log("✅ [SettingPage3] 초기 세션 및 문서 로딩 완료");
    };

    init();
  }, [projectId]);

  // ------------------------------
  // 🔥 탭 전환 처리 (이미 캐시된 문서 표시, SSE 연결은 하지 않음)
  // ------------------------------
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // 문서는 이미 로드되어 있으므로 캐시에서 즉시 표시됨
    // SSE는 메시지 전송 시에만 사용
  };

  // ------------------------------
  // 🔥 메시지 전송 + SSE
  // ------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const sessionId = chatSessions[activeTab];
    if (!sessionId) {
      alert("세션 준비 중입니다.");
      return;
    }

    // 기존 스트림 정리
    if (streamCleanupRef.current[activeTab]) {
      streamCleanupRef.current[activeTab]?.();
      streamCleanupRef.current[activeTab] = null;
    }

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], userMsg],
    }));

    const userText = inputMessage.trim();
    setInputMessage("");
    setIsSubmitting(true);

    // 서버에 메시지 전송
    await sendMessage(sessionId, {
      project_id: Number(projectId),
      content_md: userText,
      file_type: activeTab,
    });

    // SSE 스트림 시작
    const cleanup = await getStream(
      sessionId,
      (chunk) => {
        if (!chunk || chunk.trim() === "") return;

        if (chunk.trim() === "[DONE]" || chunk.trim() === "OK") {
          setIsSubmitting(false);
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(chunk);
        } catch {
          return;
        }

        // 🔥 문서 업데이트
        if (parsed.type === "document") {
          const md = parsed.content_md || "";
          setDocuments((prev) => ({ ...prev, [activeTab]: md }));
          return;
        }

        // 🔥 parsed.type === "data" 형식 처리
        if (parsed.type === "data" && parsed.doc) {
          const doc = parsed.doc;
          if (doc.prd) {
            const prdContent = typeof doc.prd === "string" ? doc.prd : JSON.stringify(doc.prd);
            setDocuments((prev) => ({ ...prev, PRD: prdContent }));
          }
          if (doc.user_story || doc.userStory) {
            const userStoryContent = typeof (doc.user_story || doc.userStory) === "string"
              ? (doc.user_story || doc.userStory)
              : JSON.stringify(doc.user_story || doc.userStory);
            setDocuments((prev) => ({ ...prev, USER_STORY: userStoryContent }));
          }
          if (doc.srs) {
            const srsContent = typeof doc.srs === "string" ? doc.srs : JSON.stringify(doc.srs);
            setDocuments((prev) => ({ ...prev, SRS: srsContent }));
          }
          return;
        }

        // 🔥 assistant 메시지 업데이트
        if (parsed.message || parsed.text) {
          const text = parsed.message || parsed.text;

          setMessages((prev) => {
            const last = prev[activeTab][prev[activeTab].length - 1];

            // assistant 메시지가 새로 시작됨
            if (!last || last.sender !== "assistant") {
              return {
                ...prev,
                [activeTab]: [
                  ...prev[activeTab],
                  { id: Date.now(), sender: "assistant", text, timestamp: new Date() },
                ],
              };
            }

            // 기존 assistant 말풍선에 이어 붙이기
            return {
              ...prev,
              [activeTab]: prev[activeTab].map((m, idx) =>
                idx === prev[activeTab].length - 1 ? { ...m, text: m.text + text } : m
              ),
            };
          });
        }
      },
      () => {
        setIsSubmitting(false);
        streamCleanupRef.current[activeTab] = null;
      },
      () => {
        setIsSubmitting(false);
        streamCleanupRef.current[activeTab] = null;
      }
    );

    // cleanup 함수 저장
    streamCleanupRef.current[activeTab] = cleanup;
  };

  // ------------------------------
  // 🔥 완료 = 3개 세션 각각 storeFile
  // ------------------------------
  const handleComplete = async () => {
    if (!projectId) return;

    for (const tab of ["PRD", "USER_STORY", "SRS"] as TabType[]) {
      const sessionId = chatSessions[tab];
      if (sessionId) {
        await storeFile(sessionId, { project_id: Number(projectId) });
      }
    }

    navigate({
      to: "/document/check",
      search: { projectId },
    });
  };

  // ------------------------------
  // 렌더링
  // ------------------------------
  const currentDoc = documents[activeTab];
  const currentMessages = messages[activeTab];

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
                PRD / USER_STORY / SRS 생성 및 수정
              </div>
              <div className="h-2 bg-[#D9D9D9] w-[500px] rounded-full overflow-hidden">
                <div className="h-full bg-[#7871FE] rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div className="flex gap-3 mt-4">
            {(["PRD", "USER_STORY", "SRS"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
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

        {/* 본문 */}
        <div className="flex gap-6 h-[calc(100vh-300px)]">

          {/* 문서 영역 */}
          <div className="flex-1 bg-[#7871FE]/15 rounded-2xl p-8 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {currentDoc ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {currentDoc}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  {activeTab} 문서가 아직 생성되지 않았습니다.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-800"
              >
                완료
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="w-[500px] flex flex-col border-2 border-[#7871FE] rounded-2xl bg-white overflow-hidden">
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start ml-4"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-6 py-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-[#7871FE] text-white"
                        : "bg-[#7871FE]/30 text-gray-900"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isSubmitting && (
                <div className="flex justify-start ml-4">
                  <div className="bg-[#7871FE]/30 rounded-2xl p-4">...</div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`${activeTab} 문서 수정 요청을 입력하세요...`}
                className="w-full h-[120px] px-6 py-5 bg-[#7871FE]/10 rounded-[18px]
                focus:ring-2 focus:ring-[#7871FE]/40 outline-none resize-none pr-16"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSubmitting}
                className="absolute right-5 bottom-5 h-10 w-10 bg-white border rounded-full shadow flex items-center justify-center"
              >
                <ArrowUp size={24} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}