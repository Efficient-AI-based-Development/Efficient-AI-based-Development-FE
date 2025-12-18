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
  // 🔥 로딩 말풍선 관리 (assistant 메시지 추가 시 자동 제거)
  const [isStreaming, setIsStreaming] = useState(false);
  // 🔥 완료 상태 관리
  const [isCompleted, setIsCompleted] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const streamCleanupRef = useRef<Record<TabType, (() => void) | null>>({
    PRD: null,
    USER_STORY: null,
    SRS: null,
  });
  // 🔥 첫 번째 assistant 메시지 무시 플래그 (각 탭별로 관리)
  const firstAssistantMessageIgnoredRef = useRef<Record<TabType, boolean>>({
    PRD: false,
    USER_STORY: false,
    SRS: false,
  });
  // 🔥 초기화 플래그 (React.StrictMode로 인한 2번 실행 방지)
  const initializedRef = useRef(false);

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
    // 🔥 React.StrictMode로 인한 2번 실행 방지
    if (initializedRef.current) return;
    initializedRef.current = true;

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
            content_md: "",
          });

          newSessions[tab] = session.chat_id;
          console.log(`✅ [SettingPage3] ${tab} 세션 생성 완료: ${session.chat_id}`);

          // 백엔드 문서 생성 시간 벌기
          await new Promise(res => setTimeout(res, 1500));
          
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
    if (isCompleted) return; // 완료 후 탭 전환 불가
    setActiveTab(tab);
    // 문서는 이미 로드되어 있으므로 캐시에서 즉시 표시됨
    // SSE는 메시지 전송 시에만 사용
  };

  // ------------------------------
  // 🔥 서버에서 최신 문서 가져오기
  // ------------------------------
  const refreshDocumentFromServer = async (tab: TabType) => {
    const sessionId = chatSessions[tab];
    if (!sessionId) return;

    try {
      const latestDoc = await getLatestDocument(sessionId);
      setDocuments((prev) => ({
        ...prev,
        [tab]: latestDoc || prev[tab],
      }));
    } catch (e) {
      console.error("❌ 문서 갱신 실패:", e);
    }
  };

  // ------------------------------
  // 🔥 메시지 전송 + SSE
  // ------------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isCompleted) return;

    const sessionId = chatSessions[activeTab];
    if (!sessionId) {
      alert("세션 준비 중입니다.");
      return;
    }

    // 🔥 기존 스트림 정리 (메시지 전송 직전에 무조건 정리)
    if (streamCleanupRef.current[activeTab]) {
      streamCleanupRef.current[activeTab]!();
      streamCleanupRef.current[activeTab] = null;
    }
    
    // 🔥 새로운 메시지 전송 시 첫 메시지 무시 플래그 리셋
    firstAssistantMessageIgnoredRef.current[activeTab] = false;

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
    setIsStreaming(true); // 🔥 스트리밍 시작

    // 서버에 메시지 전송
    await sendMessage(sessionId, {
      project_id: Number(projectId),
      content_md: userText,
      file_type: activeTab,
    });

    // SSE 스트림 시작 (getStream에서 이미 JSON.parse된 데이터가 전달됨)
    const cleanup = await getStream(
      sessionId,
      (parsed) => {
        // parsed는 이미 JSON 객체임 (getStream에서 파싱됨)
        let shouldRefresh = false;

        // 🔥 1) 문서 갱신이 있다면 → 먼저 갱신 (우선순위 1)
        if (parsed.doc) {
          setDocuments((prev) => ({
            ...prev,
            PRD: parsed.doc.prd !== undefined 
              ? (typeof parsed.doc.prd === "string" ? parsed.doc.prd : JSON.stringify(parsed.doc.prd))
              : prev.PRD,
            USER_STORY: parsed.doc.user_story !== undefined
              ? (typeof parsed.doc.user_story === "string" ? parsed.doc.user_story : JSON.stringify(parsed.doc.user_story))
              : prev.USER_STORY,
            SRS: parsed.doc.srs !== undefined
              ? (typeof parsed.doc.srs === "string" ? parsed.doc.srs : JSON.stringify(parsed.doc.srs))
              : prev.SRS,
          }));
          shouldRefresh = true;
        }

        // 🔥 2) 메시지 처리 (첫 메시지는 무시)
        if (parsed.message) {
          // 첫 번째 assistant 메시지 무시
          if (!firstAssistantMessageIgnoredRef.current[activeTab]) {
            firstAssistantMessageIgnoredRef.current[activeTab] = true;
            shouldRefresh = true; // 첫 메시지는 무시하지만 문서는 갱신
            // shouldRefresh가 true이므로 아래에서 한 번만 호출됨
          } else {
            const messageText = typeof parsed.message === "string" ? parsed.message : parsed.message.message || "";
            if (messageText && messageText.trim() !== "") {
              // 🔥 기존 assistant 말풍선에 이어 붙이기 (중복 방지)
              setMessages((prev) => {
                const currentMessages = prev[activeTab];
                const last = currentMessages[currentMessages.length - 1];

                // 마지막 메시지가 assistant 메시지이면 이어 붙이기
                if (last && last.sender === "assistant") {
                  return {
                    ...prev,
                    [activeTab]: currentMessages.map((m, idx) =>
                      idx === currentMessages.length - 1
                        ? { ...m, text: m.text + messageText }
                        : m
                    ),
                  };
                }

                // 새로운 assistant 메시지 생성
                return {
                  ...prev,
                  [activeTab]: [
                    ...currentMessages,
                    {
                      id: Date.now(),
                      sender: "assistant",
                      text: messageText,
                      timestamp: new Date(),
                    },
                  ],
                };
              });
              setIsStreaming(false); // 🔥 assistant 메시지가 추가되면 로딩 말풍선 제거
              shouldRefresh = true;
            }
          }
        }

        // 🔥 SSE chunk당 1번만 문서 갱신 호출
        if (shouldRefresh) {
          refreshDocumentFromServer(activeTab).catch((e) => {
            console.error("❌ 문서 갱신 실패:", e);
          });
        }
      },
      () => {
        setIsSubmitting(false);
        setIsStreaming(false); // 🔥 SSE 에러 시 스트리밍 종료
        streamCleanupRef.current[activeTab] = null;
      },
      () => {
        setIsSubmitting(false);
        setIsStreaming(false); // 🔥 SSE 완료 시 스트리밍 종료
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

    setIsCompleted(true);

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
                disabled={isCompleted}
                className={`px-6 py-3 rounded-3xl font-semibold ${
                  isCompleted
                    ? "bg-red-200 text-red-700 cursor-not-allowed"
                    : activeTab === tab
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
                disabled={isCompleted}
                className={`px-6 py-3 rounded-lg ${
                  isCompleted
                    ? "bg-red-200 text-red-700 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-800"
                }`}
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

              {isStreaming && (
                <div className="flex justify-start ml-4">
                  <div className="bg-[#7871FE]/30 rounded-2xl p-4">...</div>
                </div>
              )}
            </div>

            <form className="p-4 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isCompleted}
                placeholder={`${activeTab} 문서 수정 요청을 입력하세요...`}
                className="w-full h-[120px] px-6 py-5 bg-[#7871FE]/10 rounded-[18px]
                focus:ring-2 focus:ring-[#7871FE]/40 outline-none resize-none pr-16
                disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCompleted || !inputMessage.trim() || isSubmitting}
                className="absolute right-5 bottom-5 h-10 w-10 bg-white border rounded-full shadow flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed"
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