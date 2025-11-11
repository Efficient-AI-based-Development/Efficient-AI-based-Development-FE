import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    navigate({
      to: "/document/confirm",
      search: { initialMessage: message },
    });
  };
  const handleCardClick = (text: string) => {
    navigate({
      to: "/document/confirm",
      search: { initialMessage: text },
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white pt-28">
      {/*배경 그라데이션 원*/}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[700px] h-[700px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center," +
            "rgba(120,113,254,0.15) 22%," +
            "rgba(120,113,254,0.13) 36%," +
            "rgba(120,113,254,0.09) 53%," +
            "rgba(120,113,254,0.07) 69%," +
            "rgba(120,113,254,0.05) 83%," +
            "rgba(120,113,254,0.02) 95%)",
        }}
      />

      <h1 className="text-6xl font-semibold text-center -translate-y-3">
        무엇을 만들어볼까요?
      </h1>
      <div className="mt-8 text-2xl text-CustomGray text-center z-10">
        AI Development와 함께 체계적인 프로젝트를 만들어보세요.
      </div>

      <div className="mt-28 flex items-center justify-center flex-wrap gap-3 z-10">
        {[
          "모바일 앱 구축",
          "웹 페이지 만들기",
          "업무 자동화 툴",
          "아이디어 구현",
        ].map((t) => (
          <button
            key={t}
            onClick={() => handleCardClick(t)} // 클릭 시 바로 전송
            className="rounded-full border border-zinc-200 bg-white px-10 py-4 text-lg text-zinc-600 shadow-sm hover:shadow transition"
            type="button"
          >
            {t}
          </button>
        ))}

        <div className="relative mt-8 w-full flex justify-center z-10">
          <form onSubmit={handleSubmit} className="relative w-full max-w-[934px]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="무엇을 만들고 싶은지 입력해 보세요…"
              className="w-full h-[138px] resize-none rounded-[18px] border border-zinc-200 bg-white px-6 py-5 pr-16 text-[18px] leading-relaxed
                       placeholder:text-zinc-400 shadow-[0_8px_24px_rgba(15,23,42,0.06)]
                       focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
              aria-label="전송"
              className="absolute right-5 bottom-5 inline-flex h-10 w-10 items-center justify-center rounded-full
                       border border-zinc-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]
                       hover:bg-zinc-50 active:scale-95 transition"
            >
              <ArrowUp size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
