import apiClient from "@/services/api";
const BACKEND_URL = "http://34.61.144.150:8000";

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
  ChatDocumentsResponse,
  CreateChatSessionRequest,
  CreateChatSessionResponse,
} from "@/types/chat";
import type { AxiosError } from "axios";

/* ---------------------------------------------------------
 * 1) 프로젝트 초기 파일로 채팅 세션 시작
 * --------------------------------------------------------- */
export async function startChatWithInitFile(
  request: StartChatRequest,
): Promise<StartChatResponse> {
  try {
    let contentString: string | undefined;

    if (request.content !== undefined) {
      contentString =
        typeof request.content === "string"
          ? request.content
          : JSON.stringify(request.content);
    } else if (request.content_md) {
      contentString = request.content_md;
    } else if (request.project) {
      contentString = JSON.stringify({
        project_name: request.project.project_name,
        main_color: request.project.main_color,
        page_count: request.project.page_count,
        feature_count: request.project.feature_count,
        ai_model: request.project.ai_model,
        tech_stack: request.project.tech_stack,
      });
    }

    const contentMdString =
      typeof request.content_md === "string"
        ? request.content_md
        : request.content_md
        ? JSON.stringify(request.content_md)
        : contentString || "{}";

    const payload = {
      project_id: request.project_id ?? -1,
      file_type: request.file_type || "PROJECT",
      content: contentString || "{}",
      content_md: contentMdString,
    };

    const response = await apiClient.post<StartChatResponse>(
      "/api/v1/chats",
      payload,
    );

    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [startChatWithInitFile] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 2) 기존 프로젝트 파일로 채팅 세션 생성
 * --------------------------------------------------------- */
export async function createChatSession(
  request: CreateChatSessionRequest,
): Promise<CreateChatSessionResponse> {
  try {
    const payload: {
      project_id: number;
      file_type: string;
      content?: string;
      content_md?: string;
    } = {
      project_id: request.project_id,
      file_type: request.file_type,
      content: "{}",
    };

    // content_md가 제공된 경우에만 추가
    if (request.content_md !== undefined) {
      payload.content_md = request.content_md;
    }

    const response = await apiClient.post<StartChatResponse>(
      "/api/v1/chats",
      payload,
    );

    return {
      chat_session_id: response.data.chat_id.toString(),
      chat_id: response.data.chat_id,
      project_id: response.data.project_id,
      file_type: response.data.file_type,
      stream_url: response.data.stream_url,
      created_at: response.data.created_at,
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [createChatSession] error:", error);

    if (error.response?.status === 404) {
      console.error("❌ API not found:", error.config?.url);
    }

    throw error;
  }
}

/* ---------------------------------------------------------
 * 3) 메시지 전송
 * --------------------------------------------------------- */
export async function sendMessage(
  chatSessionId: string | number,
  request: SendMessageRequest,
): Promise<SendMessageResponse> {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      `/api/v1/chats/${chatSessionId}/messages`,
      request,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [sendMessage] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 4) SSE 스트림
 * --------------------------------------------------------- */
export async function getStream(
  chatSessionId: string | number,
  onMessage: (data: any) => void, // JSON 파싱된 객체 전달
  onError?: (error: Error) => void,
  onComplete?: () => void,
): Promise<() => void> {
  const accessToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  if (!accessToken) {
    onError?.(new Error("Access token not found"));
    return () => {};
  }

  const url = `${BACKEND_URL}/api/v1/chats/${chatSessionId}/stream?token=${accessToken}`;

  return new Promise((resolve, reject) => {
    try {
      console.log("🔗 SSE 연결:", url);
      const es = new EventSource(url, { withCredentials: true });

      // cleanup 함수
      const cleanup = () => {
        console.log("🧹 SSE 연결 정리");
        es.close();
      };

      es.onopen = () => {
        console.log("🟢 SSE 연결 성공");
        // 연결 성공 시 cleanup 함수 반환
        resolve(cleanup);
      };

      // assistant 이벤트만 처리 (JSON 파싱 후 전달)
      es.addEventListener("assistant", (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error("JSON parse error:", err, event.data);
        }
      });

      es.addEventListener("turn_end", () => {
        es.close();
        onComplete?.();
      });

      es.onerror = () => {
        const err = new Error("SSE error");
        es.close();
        onError?.(err);
        reject(err);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("❌ SSE 생성 실패:", error);
      onError?.(error);
      reject(error);
    }
  });
}

/* ---------------------------------------------------------
 * 5) 세션 취소
 * --------------------------------------------------------- */
export async function cancelSession(
  chatSessionId: string | number,
): Promise<CancelSessionResponse> {
  try {
    const response = await apiClient.post<CancelSessionResponse>(
      `/api/v1/chats/${chatSessionId}/cancel`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [cancelSession] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 6) 파일 저장
 * --------------------------------------------------------- */
export async function storeFile(
  chatSessionId: string | number,
  request: StoreFileRequest,
): Promise<StoreFileResponse> {
  try {
    const response = await apiClient.post<StoreFileResponse>(
      `/api/v1/chats/${chatSessionId}/store`,
      request,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [storeFile] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 7) 문서 업데이트
 * --------------------------------------------------------- */
export async function updateAllDocFileByTasks(
  request: UpdateAllDocFileRequest,
): Promise<UpdateAllDocFileResponse> {
  try {
    const response = await apiClient.put<UpdateAllDocFileResponse>(
      "/api/v1/chats/update",
      request,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [updateAllDocFileByTasks] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 8) 문서 조회
 * --------------------------------------------------------- */
export async function getChatDocuments(
  chatSessionId: string | number,
): Promise<ChatDocumentsResponse> {
  try {
    const response = await apiClient.get<ChatDocumentsResponse>(
      `/api/v1/chats/${chatSessionId}/documents`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [getChatDocuments] error:", error);
    throw error;
  }
}

/* ---------------------------------------------------------
 * 9) 최신 문서 조회 (tempDocument)
 * --------------------------------------------------------- */
export async function getLatestDocument(
  chatSessionId: string | number,
): Promise<string> {
  try {
    const response = await apiClient.get<string>(
      `/api/v1/chats/${chatSessionId}/tempDocument`,
    );
    return response.data || "";
  } catch (err) {
    const error = err as AxiosError;
    console.error("🔥 [getLatestDocument] error:", error);
    return "";
  }
}