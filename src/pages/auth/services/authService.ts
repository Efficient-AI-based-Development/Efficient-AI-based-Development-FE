import apiClient from "@/services/api";

export interface GoogleLoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface GoogleLoginUrlResponse {
  url: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  /**
   * 구글 로그인
   * 백엔드에서 구글 OAuth URL을 받아서 리다이렉트
   * GET /api/v1/auth/login/google -> {"url": "..."} (구글 로그인 URL)
   */
  googleLogin: async (): Promise<void> => {
    console.log("🔐 [authService] 구글 로그인 시작");

    try {
      // 백엔드에서 구글 OAuth URL 받기
      // 백엔드가 {"url": "..."} 형태로 반환
      const response = await apiClient.get<GoogleLoginUrlResponse>(
        "/api/v1/auth/login/google",
      );

      const googleAuthUrl = response.data.url;
      console.log("✅ [authService] 구글 OAuth URL 받음:", googleAuthUrl);

      // 브라우저에서 구글 로그인 페이지로 리다이렉트
      if (googleAuthUrl && googleAuthUrl.startsWith("http")) {
        window.location.href = googleAuthUrl;
      } else {
        throw new Error("유효하지 않은 구글 로그인 URL입니다.");
      }
    } catch (error) {
      console.error("❌ [authService] 구글 로그인 실패:", error);
      throw error;
    }
  },

  /**
   * 구글 로그인 콜백 처리
   * GET /api/v1/auth/login/google/callback?code=...
   * 구글 로그인 후 백엔드 콜백 엔드포인트를 호출하여 토큰 받기
   * 백엔드가 code를 쿼리 파라미터로 받음
   */
  handleGoogleCallback: async (code?: string): Promise<TokenResponse> => {
    console.log("🔐 [authService] 구글 로그인 콜백 처리", { code });

    try {
      // URL에서 code 파라미터 추출 (전달되지 않은 경우)
      if (!code) {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get("code") || undefined;
      }

      if (!code) {
        throw new Error("구글 로그인 code가 없습니다.");
      }

      // 백엔드 콜백 엔드포인트 호출 (code를 쿼리 파라미터로 전달)
      const url = `/api/v1/auth/login/google/callback?code=${encodeURIComponent(code)}`;
      const response = await apiClient.get<TokenResponse>(url);

      console.log("✅ [authService] 구글 로그인 콜백 성공:", {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        tokenType: response.data.token_type,
        hasUserInfo: !!response.data.user,
      });

      // 백엔드가 쿠키 기반 인증을 사용하므로 토큰은 쿠키에 저장됨
      // 사용자 정보만 localStorage에 저장 (선택적)
      if (response.data.user) {
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        console.log(
          "✅ [authService] 사용자 정보 저장 완료:",
          response.data.user,
        );
      }

      // 토큰이 응답에 포함된 경우에만 localStorage에 저장 (하위 호환성)
      // 백엔드가 쿠키만 사용하는 경우 이 부분은 실행되지 않음
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("accessToken", response.data.access_token);
        console.log("✅ [authService] 토큰 저장 완료 (하위 호환성):", {
          tokenLength: response.data.access_token.length,
          tokenPreview: `${response.data.access_token.substring(0, 20)}...`,
        });
      } else {
        console.log(
          "ℹ️ [authService] 토큰이 응답에 없습니다. 쿠키 기반 인증을 사용합니다.",
        );
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
        console.log("✅ [authService] refreshToken 저장 완료");
      }

      return response.data;
    } catch (error) {
      console.error("❌ [authService] 구글 로그인 콜백 처리 실패:", error);
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    console.log("🔐 [authService] 로그아웃");

    try {
      // 백엔드에 로그아웃 요청 (선택사항)
      await apiClient.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("❌ [authService] 로그아웃 API 호출 실패:", error);
    } finally {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  /**
   * 토큰 갱신
   * POST /api/v1/auth/refresh
   * refresh_token을 사용하여 새로운 access_token 발급
   * 백엔드가 HTTPBearer를 사용하므로 Authorization 헤더로 refresh_token 전달
   */
  refreshToken: async (): Promise<TokenResponse> => {
    console.log("🔐 [authService] 토큰 갱신 시작");

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("Refresh token이 없습니다.");
      }

      // 백엔드가 HTTPBearer를 사용하므로 Authorization 헤더로 refresh_token 전달
      // 별도의 axios 인스턴스를 생성하여 refresh_token을 헤더에 포함
      const response = await apiClient.post<TokenResponse>(
        "/api/v1/auth/refresh",
        undefined, // body 없음
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      console.log("✅ [authService] 토큰 갱신 성공:", {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        tokenType: response.data.token_type,
      });

      // 새 토큰 저장
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("accessToken", response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error("❌ [authService] 토큰 갱신 실패:", error);
      throw error;
    }
  },

  /**
   * 현재 사용자 정보 가져오기
   */
  getCurrentUser: async () => {
    console.log("🔐 [authService] 현재 사용자 정보 가져오기");

    try {
      const response = await apiClient.get("/api/v1/auth/me");
      console.log("✅ [authService] 사용자 정보:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [authService] 사용자 정보 가져오기 실패:", error);
      throw error;
    }
  },
};
