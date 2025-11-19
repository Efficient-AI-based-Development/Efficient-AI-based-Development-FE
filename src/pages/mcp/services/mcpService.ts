import apiClient from "@/services/api";
import type {
  ProjectMcpStatus,
  ListProjectsResponse,
  CreateConnectionRequest,
  CreateConnectionResponse,
  Connection,
  ListConnectionsResponse,
  ProviderGuideResponse,
  ProviderId,
  CreateSessionRequest,
  CreateSessionResponse,
  Session,
  ListSessionsResponse,
  ListToolsResponse,
  Tool,
  ListResourcesResponse,
  Resource,
  ListPromptsResponse,
  Prompt,
  CreateRunRequest,
  CreateRunResponse,
  Run,
  GetRunResponse,
  ListRunEventsResponse,
  RunEvent,
  CancelRunResponse,
} from "../types";
import type { AxiosError } from "axios";

/**
 * 프로젝트별 MCP 연결 현황 조회
 */
export async function listProjects(): Promise<ProjectMcpStatus[]> {
  try {
    const response = await apiClient.get<ListProjectsResponse>(
      "/api/v1/mcp/projects",
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 프로젝트 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * MCP 연결 생성
 */
export async function createConnection(
  request: CreateConnectionRequest,
): Promise<Connection> {
  try {
    const response = await apiClient.post<CreateConnectionResponse>(
      "/api/v1/mcp/connections",
      request,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 연결 생성 실패:", axiosError);
    throw error;
  }
}

/**
 * 연결 목록 조회
 */
export async function listConnections(
  projectId?: string,
): Promise<Connection[]> {
  try {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<ListConnectionsResponse>(
      "/api/v1/mcp/connections",
      { params },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 연결 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 연결 종료
 */
export async function deleteConnection(connectionId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/mcp/connections/${connectionId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 연결 종료 실패:", axiosError);
    throw error;
  }
}

/**
 * 연결 활성화
 */
export async function activateConnection(
  connectionId: string,
): Promise<Connection> {
  try {
    const response = await apiClient.post<CreateConnectionResponse>(
      `/api/v1/mcp/connections/${connectionId}/activate`,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 연결 활성화 실패:", axiosError);
    throw error;
  }
}

/**
 * MCP 연동 가이드 조회
 */
export async function getProviderGuide(
  providerId: ProviderId,
): Promise<ProviderGuideResponse> {
  try {
    const response = await apiClient.get<
      ProviderGuideResponse | { data: ProviderGuideResponse }
    >(`/api/v1/mcp/providers/${providerId}/guide`);
    // data 래퍼가 있으면 data를, 없으면 직접 반환
    return "data" in response.data ? response.data.data : response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 가이드 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션 생성
 */
export async function createSession(
  request: CreateSessionRequest,
): Promise<Session> {
  try {
    const response = await apiClient.post<CreateSessionResponse>(
      "/api/v1/mcp/sessions",
      request,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 세션 생성 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션 목록 조회
 */
export async function listSessions(connectionId?: string): Promise<Session[]> {
  try {
    const params = connectionId ? { connectionId } : {};
    const response = await apiClient.get<ListSessionsResponse>(
      "/api/v1/mcp/sessions",
      { params },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 세션 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션 종료
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/mcp/sessions/${sessionId}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 세션 종료 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션별 툴 목록 조회
 */
export async function listTools(sessionId: string): Promise<Tool[]> {
  try {
    const response = await apiClient.get<ListToolsResponse>(
      "/api/v1/mcp/tools",
      { params: { sessionId } },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 툴 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션별 리소스 목록 조회
 */
export async function listResources(sessionId: string): Promise<Resource[]> {
  try {
    const response = await apiClient.get<ListResourcesResponse>(
      "/api/v1/mcp/resources",
      { params: { sessionId } },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 리소스 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 세션별 프롬프트 목록 조회
 */
export async function listPrompts(sessionId: string): Promise<Prompt[]> {
  try {
    const response = await apiClient.get<ListPromptsResponse>(
      "/api/v1/mcp/prompts",
      { params: { sessionId } },
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 프롬프트 목록 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 실행 생성
 */
export async function createRun(request: CreateRunRequest): Promise<Run> {
  try {
    const response = await apiClient.post<CreateRunResponse>(
      "/api/v1/mcp/runs",
      request,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 실행 생성 실패:", axiosError);
    throw error;
  }
}

/**
 * 실행 상태 조회
 */
export async function getRun(runId: string): Promise<Run> {
  try {
    const response = await apiClient.get<GetRunResponse>(
      `/api/v1/mcp/runs/${runId}`,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 실행 상태 조회 실패:", axiosError);
    throw error;
  }
}

/**
 * 실행 취소
 */
export async function cancelRun(
  runId: string,
): Promise<CancelRunResponse["data"]> {
  try {
    const response = await apiClient.post<CancelRunResponse>(
      `/api/v1/mcp/runs/${runId}/cancel`,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 실행 취소 실패:", axiosError);
    throw error;
  }
}

/**
 * 실행 이벤트 조회
 */
export async function listRunEvents(runId: string): Promise<RunEvent[]> {
  try {
    const response = await apiClient.get<ListRunEventsResponse>(
      `/api/v1/mcp/runs/${runId}/events`,
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[MCP Service] 실행 이벤트 조회 실패:", axiosError);
    throw error;
  }
}
