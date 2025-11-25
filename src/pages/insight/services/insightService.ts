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
 * Task 인사이트 응답 타입
 * GET /api/v1/insights/projects/{project_id}/insights
 */
export interface TaskInsightsResponse {
  task_completed_probability: number; // Task 완료율 (float)
  task_last_updated: string; // 마지막 진행 날짜 (ISO string)
  QA_test: number; // QA 통과 Task (default: 0)
}

/**
 * 프로젝트 인사이트 조회
 * GET /api/v1/projects/{project_id}/insights
 */
export async function getProjectInsights(
  projectId: number,
): Promise<InsightsResponse> {
  const response = await apiClient.get<InsightsResponse>(
    `/api/v1/projects/${projectId}/insights`,
  );

  return response.data;
}

/**
 * 전체 인사이트 요약 조회
 * GET /api/v1/insights/summary
 */
export async function getInsightsSummary(): Promise<InsightsSummaryResponse> {
  const response = await apiClient.get<InsightsSummaryResponse>(
    `/api/v1/insights/summary`,
  );

  return response.data;
}

/**
 * Task 인사이트 조회
 * GET /api/v1/insights/projects/{project_id}/insights
 */
export async function getTaskInsights(
  projectId: number,
): Promise<TaskInsightsResponse> {
  const response = await apiClient.get<TaskInsightsResponse>(
    `/api/v1/insights/projects/${projectId}/insights`,
  );

  return response.data;
}
