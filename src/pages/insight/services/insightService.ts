import apiClient from "@/services/api";

/**
 * API 인사이트 응답 타입
 */
export interface InsightsResponse {
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  pending_tasks: number;
  total_documents: number;
  recent_activities: string[];
}

/**
 * API 전체 인사이트 요약 응답 타입
 */
export interface InsightsSummaryResponse {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  total_documents: number;
  completed_jobs_today: number;
}

/**
 * 프로젝트 인사이트 조회
 * GET /api/v1/insights/projects/{project_id}/insights
 */
export async function getProjectInsights(
  projectId: number,
): Promise<InsightsResponse> {
  console.log("[InsightService] 프로젝트 인사이트 조회 시작");
  console.log("[InsightService] Project ID:", projectId);
  console.log(
    "[InsightService] 요청 URL:",
    `/api/v1/insights/projects/${projectId}/insights`,
  );

  try {
    const response = await apiClient.get<InsightsResponse>(
      `/api/v1/insights/projects/${projectId}/insights`,
    );

    console.log("[InsightService] API 응답 받음:", response.data);
    return response.data;
  } catch (error) {
    console.error("[InsightService] 프로젝트 인사이트 조회 실패:", error);
    throw error;
  }
}

/**
 * 전체 인사이트 요약 조회
 * GET /api/v1/insights/summary
 */
export async function getInsightsSummary(): Promise<InsightsSummaryResponse> {
  console.log("[InsightService] 전체 인사이트 요약 조회 시작");
  console.log("[InsightService] 요청 URL:", `/api/v1/insights/summary`);

  try {
    const response = await apiClient.get<InsightsSummaryResponse>(
      `/api/v1/insights/summary`,
    );

    console.log(
      "[InsightService] 전체 인사이트 요약 응답 받음:",
      response.data,
    );
    return response.data;
  } catch (error) {
    console.error("[InsightService] 전체 인사이트 요약 조회 실패:", error);
    throw error;
  }
}
