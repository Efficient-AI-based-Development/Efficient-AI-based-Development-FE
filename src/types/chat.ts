/**
 * Chat API 타입 정의
 */

export type ChatFileType = "PROJECT" | "PRD" | "UserStory" | "SRS";

export interface StartChatRequest {
  file_type: ChatFileType;
  project_id?: number; // 선택적 (chatService에서 -1로 설정)
  content?: string | Record<string, any>; // 문자열 또는 객체 (chatService에서 문자열로 변환)
  project?: {
    project_name: string;
    main_color: string;
    page_count: number;
    feature_count: number;
    ai_model: string;
    tech_stack: string[];
  };
  content_md?: string;
}

export interface StartChatResponse {
  chat_id: number;
  stream_url: string;
  file_type: ChatFileType;
  project_id: number;
  created_at: string;
}

export interface SendMessageRequest {
  content_md: string;
  project_id?: number; // SettingPage3에서 사용
  file_type?: "PRD" | "UserStory" | "SRS" | "USER_STORY"; // SettingPage3에서 사용 (USER_STORY 지원)
}

export type SendMessageResponse = string;

export type CancelSessionResponse = string;

export interface StoreFileRequest {
  project_id: number;
}

export interface StoreFileResponse {
  ok: boolean;
  file_type: string;
  file_id: number;
  updated_at: string;
}

export interface UpdateAllDocFileRequest {
  project_id: number;
}

export interface UpdateAllDocFileResponse {
  ok: boolean;
  project_id: number;
}

export interface ChatDocumentsResponse {
  prd: string;
  user_story: string;
  srs: string;
}

export interface CreateChatSessionRequest {
  project_id: number;
  file_type: "PRD" | "UserStory" | "SRS";
  content_md?: string; // 필수 필드 (기본값: "")
}

export interface CreateChatSessionResponse {
  chat_session_id: string;
  chat_id: number;
  project_id: number;
  file_type: string;
  stream_url: string;
  created_at: string;
}
