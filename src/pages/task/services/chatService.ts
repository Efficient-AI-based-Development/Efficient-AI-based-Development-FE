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
    // content를 반드시 문자열로 변환 (FastAPI 요구사항)
    let contentString: string | undefined;
    
    // 1. request.content가 있는 경우 (우선순위 1)
    if (request.content !== undefined) {
      if (typeof request.content === "string") {
        // 이미 문자열이면 그대로 사용
        contentString = request.content;
        console.log("✅ [Chat Service] content는 이미 문자열입니다.");
      } else {
        // 객체면 반드시 JSON.stringify
        contentString = JSON.stringify(request.content);
        console.log("🔄 [Chat Service] content 객체를 JSON.stringify로 변환했습니다.");
      }
    }
    // 2. request.content_md가 있는 경우 (하위 호환성)
    else if (request.content_md) {
      contentString = request.content_md;
      console.log("✅ [Chat Service] content_md를 content로 사용합니다.");
    }
    // 3. request.project가 있는 경우
    else if (request.project) {
      // project 객체를 JSON.stringify로 변환
      contentString = JSON.stringify({
        project_name: request.project.project_name,
        main_color: request.project.main_color,
        page_count: request.project.page_count,
        feature_count: request.project.feature_count,
        ai_model: request.project.ai_model,
        tech_stack: request.project.tech_stack,
      });
      console.log("🔄 [Chat Service] project 객체를 JSON.stringify로 변환했습니다.");
    }

    // ⚠️ ...request를 spread하지 않고 명시적으로 필드 지정 (객체가 그대로 들어가는 것 방지)
    // content_md도 유효한 JSON 문자열이어야 함 (빈 문자열 X)
    let contentMdString: string;
    if (request.content_md) {
      // content_md가 이미 문자열이면 그대로 사용, 객체면 JSON.stringify
      contentMdString = typeof request.content_md === "string"
        ? request.content_md
        : JSON.stringify(request.content_md);
    } else {
      // content_md가 없으면 content와 동일한 값 사용 (또는 빈 객체 JSON)
      contentMdString = contentString || "{}";
    }

    const payload = {
      project_id: request.project_id ?? -1, // request에 project_id가 있으면 사용, 없으면 -1
      file_type: request.file_type || "PROJECT",
      content: contentString || "{}", // 반드시 문자열 (JSON 문자열)
      content_md: contentMdString, // 필수 필드, 유효한 JSON 문자열
    };

    if (payload.project_id === -1 && !payload.content) {
      throw new Error(
        "[Chat Service] project_id가 -1인 경우 content(프로젝트 정보)가 필요합니다.",
      );
    }

    // content가 문자열인지 최종 확인 (이중 체크)
    if (payload.content && typeof payload.content !== "string") {
      console.error("❌ [Chat Service] content 타입 오류:", typeof payload.content, payload.content);
      throw new Error(
        "[Chat Service] content는 반드시 문자열이어야 합니다. JSON.stringify를 사용하세요.",
      );
    }

    console.log("📦 최종 보낼 payload:", JSON.stringify(payload, null, 2));
    console.log("🔍 content 타입 확인:", typeof payload.content, payload.content ? "문자열 ✅" : "없음 ❌");

    const response = await apiClient.post<StartChatResponse>(
      "/api/v1/chats",
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.log("🔥 chatService.ts catch 호출됨?");
    console.error("🔥 [Chat Service Catch] 에러 객체 전체:", error);
    console.error("🔥 [Chat Service Catch] error.response:", error?.response);
    console.error("🔥 [Chat Service Catch] error.response.data:", error?.response?.data);
    console.error("🔥 [Chat Service Catch] detail:", error?.response?.data?.detail);
    throw error;
  }
}

/**
 * 메시지 전송
 * POST /api/v1/chats/{chat_session_id}/messages
 */
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
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 메시지 전송 실패:", axiosError);
    throw error;
  }
}

/**
 * 스트리밍 응답 받기 (Server-Sent Events)
 * GET /api/v1/chats/{chat_session_id}/stream
 * OpenAI 스타일 SSE 이벤트 기반 처리
 */
export async function getStream(
  chatSessionId: string | number,
  onMessage: (data: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
): Promise<void> {

  // 1) 백엔드 URL
  const BACKEND_URL = "http://34.61.144.150:8000";

  // 2) accessToken 가져오기 (Header가 아니라 SSE query로 넣어야 함)
  const accessToken =
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token");
  if (!accessToken) {
    console.error("❌ accessToken이 없습니다. 로그인 후 다시 시도하세요.");
    onError?.(new Error("Access token not found"));
    return;
  }

  // 3) SSE URL 생성
  const url = `${BACKEND_URL}/api/v1/chats/${chatSessionId}/stream?token=${accessToken}`;

  return new Promise((resolve, reject) => {
    try {
      console.log("🔗 [Chat Service] EventSource 연결 시도:", url);

      const es = new EventSource(url, { withCredentials: true });

      es.addEventListener("assistant", (event) => {
        console.log("📨 assistant:", event.data);
        onMessage(event.data);
      });

      es.addEventListener("turn_end", () => {
        console.log("🟢 turn_end");
        es.close();
        onComplete?.();
        resolve();
      });

      es.addEventListener("cancel", () => {
        console.log("⚠ cancel");
        es.close();
        const err = new Error("스트리밍이 취소되었습니다.");
        onError?.(err);
        reject(err);
      });

      es.addEventListener("timeout", (event) => {
        console.log("⏱ timeout:", event.data);
        es.close();
        const err = new Error(`스트리밍 타임아웃: ${event.data}`);
        onError?.(err);
        reject(err);
      });

      es.onerror = (err) => {
        console.error("❌ SSE error:", err);
        es.close();
        onError?.(new Error("SSE 연결 오류가 발생했습니다."));
        reject(new Error("SSE 연결 오류가 발생했습니다."));
      };

      es.onopen = () => {
        console.log("🟢 EventSource 연결 성공");
      };

    } catch (error: any) {
      console.error("❌ EventSource 생성 실패:", error);
      onError?.(error);
      reject(error);
    }
  });
}


/**
 * 세션 취소
 * POST /api/v1/chats/{chat_session_id}/cancel
 */
export async function cancelSession(
  chatSessionId: string | number,
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
  chatSessionId: string | number,
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

/**
 * 채팅 세션의 문서 조회
 * GET /api/v1/chats/{chat_session_id}/documents
 */
export async function getChatDocuments(
  chatSessionId: string | number,
): Promise<ChatDocumentsResponse> {
  try {
    const response = await apiClient.get<ChatDocumentsResponse>(
      `/api/v1/chats/${chatSessionId}/documents`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Chat Service] 문서 조회 실패:", axiosError);
    throw error;
  }
}
