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

// 세션 생성 요청
export interface CreateSessionRequest {
  connectionId: string;
  projectId: string;
  metadata?: Record<string, unknown>;
}

// 세션 상태
export type SessionStatus = "ready" | "active" | "closed" | "error";

// 세션 정보
export interface Session {
  sessionId: string;
  connectionId: string;
  status: SessionStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// 세션 생성 응답
export interface CreateSessionResponse {
  data: Session;
}

// 세션 목록 응답
export interface ListSessionsResponse {
  data: Session[];
}

// 툴 정보
export interface Tool {
  toolId: string;
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

// 툴 목록 응답
export interface ListToolsResponse {
  data: Tool[];
}

// 리소스 정보
export interface Resource {
  uri: string;
  kind: string;
  description?: string;
}

// 리소스 목록 응답
export interface ListResourcesResponse {
  data: Resource[];
}

// 프롬프트 정보
export interface Prompt {
  promptId: string;
  name: string;
  description?: string;
}

// 프롬프트 목록 응답
export interface ListPromptsResponse {
  data: Prompt[];
}

// 실행 모드
export type RunMode = "chat" | "tool" | "prompt";

// 실행 생성 요청
export interface CreateRunRequest {
  sessionId: string;
  mode: RunMode;
  input: Record<string, unknown>;
  toolId?: string;
  promptId?: string;
  config?: Record<string, unknown>;
}

// 실행 상태
export type RunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

// 실행 정보
export interface Run {
  runId: string;
  sessionId?: string;
  mode?: RunMode;
  status: RunStatus;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  result?: Record<string, unknown>;
  message?: string;
  output?: {
    outputText?: string;
    [key: string]: unknown;
  };
  error?: string;
}

// 실행 생성 응답
export interface CreateRunResponse {
  data: Run;
}

// 실행 조회 응답
export interface GetRunResponse {
  data: Run;
}

// 실행 이벤트 타입
export type RunEventType = "RUN_STATUS" | "RUN_RESULT";

// 실행 이벤트
export interface RunEvent {
  eventId?: string;
  runId?: string;
  type?: RunEventType | string;
  timestamp?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// 실행 이벤트 목록 응답
export interface ListRunEventsResponse {
  data: RunEvent[];
}

// 실행 취소 응답
export interface CancelRunResponse {
  data: {
    cancelled?: boolean;
    runId?: string;
    [key: string]: unknown;
  };
}
