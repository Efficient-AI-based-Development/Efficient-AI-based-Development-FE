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
