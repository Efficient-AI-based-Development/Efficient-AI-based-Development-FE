import axios from "axios";

// API 기본 URL 설정 (환경 변수에서 가져오기)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://34.61.144.150:8000";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (필요시 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    console.log("[API Client] 요청 인터셉터");
    console.log("[API Client] Base URL:", API_BASE_URL);
    console.log("[API Client] 요청 URL:", config.url);
    console.log("[API Client] 전체 URL:", `${config.baseURL}${config.url}`);
    console.log("[API Client] 요청 Method:", config.method?.toUpperCase());
    console.log("[API Client] 요청 Headers:", config.headers);
    if (config.data) {
      console.log(
        "[API Client] 요청 Body:",
        JSON.stringify(config.data, null, 2),
      );
    }
    // 인증 토큰 추가
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API Client] 인증 토큰 추가됨");
    } else {
      console.warn(
        "[API Client] 토큰이 없습니다. localStorage에 'token' 또는 'accessToken' 키를 확인하세요.",
      );
    }
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
    console.log("[API Client] 응답 인터셉터 - 성공");
    console.log("[API Client] 응답 URL:", response.config.url);
    console.log("[API Client] 응답 Status:", response.status);
    console.log("[API Client] 응답 Headers:", response.headers);
    console.log(
      "[API Client] 응답 Data:",
      JSON.stringify(response.data, null, 2),
    );
    return response;
  },
  async (error) => {
    console.error("[API Client] 응답 인터셉터 - 에러");

    // 401 또는 403 에러인 경우 인증 문제 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      const refreshToken = localStorage.getItem("refreshToken");
      const originalRequest = error.config;
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      // 401 또는 403 에러이고 refreshToken이 있으면 토큰 갱신 시도
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        refreshToken &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          console.log(
            `[API Client] ${error.response?.status} 에러 발생, 토큰 갱신 시도`,
          );
          const { authService } = await import(
            "@/pages/auth/services/authService"
          );
          await authService.refreshToken();

          // 원래 요청 재시도
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("[API Client] 토큰 갱신 실패:", refreshError);
          // 토큰 갱신 실패 시 에러만 반환 (리다이렉트는 각 컴포넌트에서 처리)
          // Chat API 같은 경우 리다이렉트하지 않고 에러 메시지만 표시해야 함
          return Promise.reject(refreshError);
        }
      } else {
        // 토큰이 없거나 403 에러인 경우
        // 리다이렉트하지 않고 에러만 반환 (각 컴포넌트에서 처리)
        console.error(
          `[API Client] ${error.response?.status} 에러 발생${
            !token ? ", 토큰 없음" : ", 권한 문제일 수 있음"
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
