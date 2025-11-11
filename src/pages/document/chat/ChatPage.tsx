import { useState, useEffect, useRef } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const search = useSearch({ from: "/document/chat" });
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedInitialMessageRef = useRef<string | null>(null);
  const isComposingRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  // 초기 메시지 설정 (표시하지 않음)
  useEffect(() => {
    const initialMessage = (search as Record<string, unknown>)
      ?.initialMessage as string | undefined;
    
    // 새로운 initialMessage가 있고, 아직 처리하지 않은 경우에만 실행
    if (initialMessage && processedInitialMessageRef.current !== initialMessage) {
      processedInitialMessageRef.current = initialMessage;
      // 처음 보낸 메시지는 표시하지 않음
      setMessages([]);
    }
  }, [search]);

  // 초기 메시지에 대한 자동 응답 (별도 useEffect로 분리)
  useEffect(() => {
    // 초기 메시지가 있고, 메시지가 비어있고, assistant 메시지가 없는 경우에만 응답 생성
    const initialMessage = (search as Record<string, unknown>)
      ?.initialMessage as string | undefined;
    if (
      initialMessage &&
      messages.length === 0 &&
      !messages.some((msg) => msg.sender === "assistant")
    ) {
      // 기존 timeout 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 자동으로 AI 응답 생성 후 세팅 페이지로 이동
      timeoutRef.current = setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          // 세팅 페이지로 이동
          navigate({
            to: "/document/confirm",
            search: { initialMessage },
          });
        }
        timeoutRef.current = null;
      }, 1000);
    }

    // cleanup: 컴포넌트 언마운트 시에만 timeout 정리
    return () => {
      // cleanup에서는 timeout을 취소하지 않음
      // React Strict Mode에서도 응답이 오도록 함
    };
  }, [messages, search, navigate]);

  // 컴포넌트 언마운트 시에만 timeout 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const messageToSend = inputMessage.trim();
    if (!messageToSend || isSubmitting) return;

    setIsSubmitting(true);
    
    // 입력창을 먼저 비움
    setInputMessage("");

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // TODO: AI 응답 처리
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "네, 알겠습니다. 프로젝트를 생성하겠습니다.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            메시지를 입력해주세요.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-indigo-200"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              // 한글 입력 중이면 Enter 키 무시
              if (isComposingRef.current) {
                return;
              }
              
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // handleSubmit을 직접 호출하여 입력창이 제대로 비워지도록 함
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}

