import apiClient from "@/services/api";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface GoogleLoginUrlResponse {
  url: string;
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
   * 구글 OAuth code를 토큰으로 교환
   * POST /api/v1/auth/login/google/exchange
   */
  googleTokenExchange: async (code: string): Promise<TokenResponse> => {
    console.log("🔐 [authService] 구글 토큰 교환 시작", { code });

    try {
      const response = await apiClient.post<TokenResponse>(
        "/api/v1/auth/login/google/exchange",
        { code },
      );

      console.log("✅ [authService] 구글 토큰 교환 성공:", {
        hasAccessToken: !!response.data?.access_token,
        hasRefreshToken: !!response.data?.refresh_token,
        tokenType: response.data?.token_type,
        fullResponse: response.data,
      });

      // 응답 데이터 검증
      if (!response.data) {
        throw new Error("백엔드 응답 데이터가 없습니다.");
      }

      if (!response.data.access_token) {
        throw new Error("access_token이 응답에 없습니다.");
      }

      // 토큰 저장
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 플래그 설정
      
      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      // 저장 확인
      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        throw new Error("토큰 저장에 실패했습니다.");
      }

      // 로그인 상태 변경 이벤트 발생 (Header 컴포넌트가 감지할 수 있도록)
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("loginStatusChanged", { detail: { isLoggedIn: true } }));

      console.log("✅ [authService] 토큰 저장 완료:", {
        hasToken: !!localStorage.getItem("token"),
        hasAccessToken: !!localStorage.getItem("accessToken"),
        hasRefreshToken: !!localStorage.getItem("refreshToken"),
        isLoggedIn: localStorage.getItem("isLoggedIn"),
      });

      return response.data;
    } catch (error) {
      console.error("❌ [authService] 구글 토큰 교환 실패:", error);
      
      // 상세한 에러 정보 로깅
      if (error instanceof Error) {
        console.error("❌ [authService] 에러 메시지:", error.message);
        console.error("❌ [authService] 에러 스택:", error.stack);
      }
      
      // Axios 에러인 경우 응답 정보도 로깅
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error("❌ [authService] 응답 상태:", axiosError.response?.status);
        console.error("❌ [authService] 응답 데이터:", axiosError.response?.data);
      }
      
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
      localStorage.removeItem("isLoggedIn"); // 로그인 상태 플래그 제거
      
      // 로그인 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("loginStatusChanged", { detail: { isLoggedIn: false } }));
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

