export type AssistantType = "Cursor" | "Claude" | "ChatGPT";

export const ASSISTANTS: AssistantType[] = ["Cursor", "Claude", "ChatGPT"];

// Provider ID 타입 (API에서 사용)
export type ProviderId = "chatgpt" | "claude" | "cursor";

// AssistantType을 ProviderId로 매핑
export function mapAssistantToProvider(assistant: AssistantType): ProviderId {
  const mapping: Record<AssistantType, ProviderId> = {
    ChatGPT: "chatgpt",
    Claude: "claude",
    Cursor: "cursor",
  };
  return mapping[assistant];
}

// MCP 연결 상태
export type McpStatus = "connected" | "pending" | "None";
export type ConnectionStatus = "pending" | "active" | "inactive" | "error";

// 프로젝트 MCP 상태
export interface ProjectMcpStatus {
  id: string;
  name: string;
  mcpStatus: McpStatus;
}

// 프로젝트 목록 응답
export interface ListProjectsResponse {
  data: ProjectMcpStatus[];
}

// 연결 생성 요청
export interface CreateConnectionRequest {
  providerId: ProviderId;
  projectId: string;
  config?: Record<string, unknown>;
  env?: Record<string, string>;
}

// 연결 정보
export interface Connection {
  connectionId: string;
  providerId: ProviderId;
  status: ConnectionStatus;
  createdAt: string;
  config?: Record<string, unknown>;
}

// 연결 생성 응답
export interface CreateConnectionResponse {
  data: Connection;
}

// 연결 목록 응답
export interface ListConnectionsResponse {
  data: Connection[];
}

// 가이드 단계
export interface GuideStep {
  title: string;
  description: string;
  commands: Array<{ text: string }>;
}

// 플랫폼별 가이드
export interface PlatformGuide {
  os: string;
  steps: GuideStep[];
}

// 가이드 응답
export interface ProviderGuideResponse {
  providerId: ProviderId;
  providerName: string;
  supportedAgents: string[];
  prerequisites: string[];
  platforms: PlatformGuide[];
}
