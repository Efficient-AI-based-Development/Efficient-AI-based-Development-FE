import axios, { AxiosError } from "axios";

// axios 전역 설정: 모든 요청에 쿠키 포함
axios.defaults.withCredentials = true;

// API 기본 URL 설정
const API_BASE_URL = "http://34.61.144.150:8000";

// axios 인스턴스 생성
// 쿠키 기반 인증 사용 (백엔드가 쿠키로 토큰을 전달)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000, // 1000000ms 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 직접 전송
});

// 요청 인터셉터 (필요시 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 쿠키 기반 인증 사용 (백엔드가 쿠키로 토큰을 전달)
    // withCredentials: true로 설정되어 있어 쿠키가 자동으로 전송됨
    // localStorage 토큰은 선택적으로 사용 (하위 호환성)
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      // 토큰이 있으면 Authorization 헤더도 추가 (하위 호환성)
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 쿠키 설정 확인 로그
    console.log("🍪 [API Client] 요청 설정:", {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      hasToken: !!token,
      headers: {
        Authorization: config.headers.Authorization ? "Bearer ***" : "없음",
        "Content-Type": config.headers["Content-Type"],
      },
    });
    
    return config;
  },
  (error) => {
    console.error("[API Client] 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (에러 처리 및 토큰 갱신)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("[API Client] 응답 인터셉터 - 에러");

    // 토큰 갱신 요청 자체는 인터셉터에서 제외 (무한 루프 방지)
    const isRefreshRequest = error.config?.url?.includes("/auth/refresh");
    if (isRefreshRequest) {
      console.error("[API Client] 토큰 갱신 요청 실패, 인터셉터 건너뜀");
      return Promise.reject(error);
    }

    // 401 또는 403 에러인 경우 인증 문제 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      const refreshToken = localStorage.getItem("refreshToken");
      const originalRequest = error.config;
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      // 토큰 갱신 API 자체가 401을 반환한 경우 무한 루프 방지
      const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");
      if (isRefreshRequest) {
        console.error("[API Client] 토큰 갱신 API가 401을 반환했습니다. 로그인이 필요합니다.");
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        return Promise.reject(error);
      }

      // 401 또는 403 에러이고 refreshToken이 있으면 토큰 갱신 시도
      // 단, 이미 재시도한 요청이거나 토큰 갱신 중인 요청은 제외
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        refreshToken &&
        !originalRequest._retry &&
        !originalRequest._isRefreshing
      ) {
        originalRequest._retry = true;
        originalRequest._isRefreshing = true;

        try {
          console.log(
            `[API Client] ${error.response?.status} 에러 발생, 토큰 갱신 시도`,
          );
          const { authService } = await import(
            "@/pages/auth/services/authService"
          );
          await authService.refreshToken();

          // 토큰 갱신 성공 후 플래그 제거
          originalRequest._isRefreshing = false;

          // 원래 요청 재시도
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("[API Client] 토큰 갱신 실패:", refreshError);
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isLoggedIn");
          // 토큰 갱신 실패 시 플래그 제거 및 토큰 정리
          originalRequest._isRefreshing = false;

          // 토큰 갱신 실패 시 refreshToken도 제거하여 무한 루프 방지
          const axiosError = refreshError as AxiosError;
          if (
            axiosError.response?.status === 401 ||
            axiosError.response?.status === 403
          ) {
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            console.warn("[API Client] 토큰 갱신 실패로 인해 토큰 제거");
          }

          // 토큰 갱신 실패 시 에러만 반환 (리다이렉트는 각 컴포넌트에서 처리)
          return Promise.reject(refreshError);
        }
      } else {
        // 쿠키 기반 인증 사용 중이므로 토큰이 없어도 쿠키로 인증 시도했을 수 있음
        // 리다이렉트하지 않고 에러만 반환 (각 컴포넌트에서 처리)
        console.error(
          `[API Client] ${error.response?.status} 에러 발생${
            !token
              ? ", 쿠키 기반 인증 사용 중 (쿠키 확인 필요)"
              : ", 권한 문제일 수 있음"
          }`,
        );
        return Promise.reject(error);
      }
    }

    // 공통 에러 처리
    if (error.response) {
      // 서버에서 응답이 왔지만 에러 상태 코드
      console.error("[API Client] 응답 Status:", error.response.status);
      console.error("[API Client] 응답 Data:", error.response.data);
      console.error("[API Client] 응답 Headers:", error.response.headers);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error(
        "[API Client] Network Error - 요청은 전송되었으나 응답 없음",
      );
      console.error("[API Client] 요청 정보:", error.request);
      console.error("[API Client] 요청 URL:", error.config?.url);
      console.error("[API Client] 요청 BaseURL:", error.config?.baseURL);
    } else {
      // 요청 설정 중 에러
      console.error("[API Client] 요청 설정 에러:", error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;