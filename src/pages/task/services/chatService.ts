import apiClient from "@/services/api";
import type {
  StartChatRequest,
  StartChatResponse,
  SendMessageRequest,
  SendMessageResponse,
  CancelSessionResponse,
  StoreFileRequest,
  StoreFileResponse,
  UpdateAllDocFileRequest,
  UpdateAllDocFileResponse,
} from "@/types/chat";
import type { AxiosError } from "axios";

/**
 * 채팅 세션 시작 (프로젝트 파일로 초기화)
 * POST /api/v1/chats
 */
export async function startChatWithInitFile(
  request: StartChatRequest,
): Promise<StartChatResponse> {
  try {
    const response = await apiClient.post<StartChatResponse>(
      "/api/v1/chats",
      request,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 채팅 세션 시작 실패:", axiosError);
    throw error;
  }
}

/**
 * 메시지 전송
 * POST /api/v1/chats/{chat_session_id}/messages
 */
export async function sendMessage(
  chatSessionId: number,
  request: SendMessageRequest,
): Promise<SendMessageResponse> {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      `/api/v1/chats/${chatSessionId}/messages`,
      request,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 메시지 전송 실패:", axiosError);
    throw error;
  }
}

/**
 * 스트리밍 응답 받기 (Server-Sent Events)
 * GET /api/v1/chats/{chat_session_id}/stream
 */
export async function getStream(
  chatSessionId: number,
  onMessage: (data: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
): Promise<void> {
  // 로컬 개발 환경에서는 Vite proxy를 사용하도록 상대 경로 사용
  const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (isDev ? "" : "http://34.61.144.150:8000");

  const url = `${API_BASE_URL}/api/v1/chats/${chatSessionId}/stream`;
  const headers: HeadersInit = {
    Accept: "text/event-stream",
  };

  // 쿠키 기반 인증 사용 (credentials: "include"로 쿠키 자동 전송)
  // localStorage 토큰은 선택적으로 사용 (하위 호환성)
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include", // 쿠키 기반 인증을 위해 필요
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data.trim()) {
            onMessage(data);
          }
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Chat Service] 스트리밍 실패:", err);
    onError?.(err);
    throw err;
  }
}

/**
 * 세션 취소
 * POST /api/v1/chats/{chat_session_id}/cancel
 */
export async function cancelSession(
  chatSessionId: number,
): Promise<CancelSessionResponse> {
  try {
    const response = await apiClient.post<CancelSessionResponse>(
      `/api/v1/chats/${chatSessionId}/cancel`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 세션 취소 실패:", axiosError);
    throw error;
  }
}

/**
 * 파일 저장
 * POST /api/v1/chats/{chat_session_id}/store
 */
export async function storeFile(
  chatSessionId: number,
  request: StoreFileRequest,
): Promise<StoreFileResponse> {
  try {
    const response = await apiClient.post<StoreFileResponse>(
      `/api/v1/chats/${chatSessionId}/store`,
      request,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 파일 저장 실패:", axiosError);
    throw error;
  }
}

/**
 * 모든 문서 파일 업데이트 (태스크 기준)
 * PUT /api/v1/chats/update
 */
export async function updateAllDocFileByTasks(
  request: UpdateAllDocFileRequest,
): Promise<UpdateAllDocFileResponse> {
  try {
    const response = await apiClient.put<UpdateAllDocFileResponse>(
      "/api/v1/chats/update",
      request,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 문서 파일 업데이트 실패:", axiosError);
    throw error;
  }
}
