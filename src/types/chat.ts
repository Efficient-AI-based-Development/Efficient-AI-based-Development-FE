/**
 * Chat API 타입 정의
 */

export type ChatFileType = "PROJECT";

export interface StartChatRequest {
  content_md: string;
  file_type: ChatFileType;
  project_id: number;
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
}

export type SendMessageResponse = string;

export interface CancelSessionResponse {
  message?: string;
}

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
