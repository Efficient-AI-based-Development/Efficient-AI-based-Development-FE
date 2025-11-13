import { useNavigate } from "@tanstack/react-router";

export default function HomePage() {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate({
      to: "/document/confirm",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/*배경 그라데이션 원*/}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[700px] h-[700px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center," +
            "rgba(120,113,254,0.22) 22%," +
            "rgba(120,113,254,0.17) 36%," +
            "rgba(120,113,254,0.12) 53%," +
            "rgba(120,113,254,0.09) 69%," +
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

      <div className="mt-28 flex items-center justify-center z-10">
        <button
          onClick={handleCardClick}
          className="rounded-full border border-zinc-200 bg-white px-10 py-4 text-lg text-zinc-600 shadow-md hover:shadow transition"
          type="button"
        >
          지금 바로 만들러가기
        </button>
      </div>
    </div>
  );
}
