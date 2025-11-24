import { useState, useEffect } from "react";
import { authService } from "./services/authService";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 구글 로그인 콜백 처리 (구글 인증 후 리다이렉트된 경우)
  useEffect(() => {
    // 구글 로그인 후 리다이렉트된 경우 자동으로 콜백 처리
    const urlParams = new URLSearchParams(window.location.search);
    const hasCallbackParams = urlParams.has("code") || urlParams.has("state");

    // 구글 OAuth 리다이렉트 후인지 확인 (code나 state 파라미터가 있으면)
    if (hasCallbackParams) {
      console.log("📥 [LoginPage] OAuth 콜백 파라미터 감지:", {
        code: urlParams.get("code"),
        state: urlParams.get("state"),
      });
      handleGoogleCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleCallback = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // URL에서 code 파라미터 추출하여 전달
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      
      const tokenResponse = await authService.handleGoogleCallback(code || undefined);
      console.log("✅ [LoginPage] 로그인 성공:", tokenResponse);

      // 토큰이 정상적으로 저장되었는지 확인
      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        throw new Error("토큰 저장에 실패했습니다.");
      }

      // URL 파라미터 제거하고 세팅1 페이지로 즉시 리다이렉트
      window.history.replaceState({}, "", "/login");
      
      // navigate 대신 window.location을 사용하여 확실하게 리다이렉트
      window.location.href = "/document/setting1";
    } catch (error) {
      console.error("❌ [LoginPage] 로그인 콜백 처리 실패:", error);
      
      // 네트워크 에러인 경우 더 자세한 메시지 표시
      let errorMessage = "로그인 처리에 실패했습니다. 다시 시도해주세요.";
      if (error instanceof Error) {
        if (error.message.includes("Network Error") || error.message.includes("network")) {
          errorMessage = "네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 백엔드에서 구글 로그인 URL 받아서 리다이렉트
      await authService.googleLogin();
      // 리다이렉트되므로 여기까지 도달하지 않음
    } catch (error) {
      console.error("❌ [LoginPage] 구글 로그인 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "구글 로그인에 실패했습니다. 다시 시도해주세요.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7871FE]/10 via-white to-[#7871FE]/5">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* 헤더 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
            <p className="text-gray-600">
              AI Development와 함께 프로젝트를 시작하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google로 로그인</span>
              </>
            )}
          </button>

          {/* 안내 문구 */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>
              로그인 시{" "}
              <a href="#" className="text-[#7871FE] hover:underline">
                이용약관
              </a>
              과{" "}
              <a href="#" className="text-[#7871FE] hover:underline">
                개인정보처리방침
              </a>
              에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

