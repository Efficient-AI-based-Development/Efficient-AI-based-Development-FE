import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function DocumentPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 초기 세팅 페이지로 리다이렉트
    navigate({ to: "/document/setting1" });
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">문서 페이지</h1>
      <p className="text-gray-600">프로젝트 설정 페이지로 이동 중...</p>
    </div>
  );
}
