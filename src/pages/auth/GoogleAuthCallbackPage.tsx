import { useEffect, useState } from "react";
import { authService } from "./services/authService";

export default function GoogleAuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // URL에서 code 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }
        
        console.log("📥 [GoogleAuthCallbackPage] OAuth code 받음:", code);
        
        // 토큰 교환
        const tokenResponse = await authService.googleTokenExchange(code);
        console.log("✅ [GoogleAuthCallbackPage] 로그인 성공:", tokenResponse);

        // 토큰 저장 확인
        const savedToken = localStorage.getItem("accessToken");
        if (!savedToken) {
          throw new Error("토큰 저장에 실패했습니다.");
        }

        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        console.log("✅ [GoogleAuthCallbackPage] 로그인 상태:", isLoggedIn);

        // 세팅1 페이지로 리다이렉트
        window.location.replace("/document/setting1");
      } catch (error) {
        console.error("❌ [GoogleAuthCallbackPage] 로그인 콜백 처리 실패:", error);
        
        let errorMessage = "로그인 처리에 실패했습니다. 다시 시도해주세요.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    handleGoogleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7871FE]/10 via-white to-[#7871FE]/5">
        <div className="w-full max-w-md p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-red-600">로그인 실패</h1>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.href = "/login"}
                className="mt-4 px-6 py-2 bg-[#7871FE] text-white rounded-lg hover:bg-[#6a63d4] transition-colors"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7871FE]/10 via-white to-[#7871FE]/5">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7871FE] mx-auto"></div>
            <h1 className="text-2xl font-bold text-gray-900">로그인 처리 중...</h1>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

