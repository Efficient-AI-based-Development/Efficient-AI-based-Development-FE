import apiClient from "@/services/api";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  ApiTaskType,
} from "@/types/task";
import type { TaskType } from "@/types/task";
import type { AxiosError } from "axios";

/**
 * TaskType을 API 타입으로 변환
 * DEV → "feat", DESIGN → "design", DOCS → "docs"
 */
export function mapTaskTypeToApiType(taskType: TaskType): ApiTaskType {
  const mapping: Record<TaskType, ApiTaskType> = {
    DEV: "feat",
    DESIGN: "design",
    DOCS: "docs",
  };
  return mapping[taskType];
}

/**
 * 태스크 생성 API 호출
 * POST /api/v1/projects/{project_id}/tasks
 */
export async function createTask(
  projectId: number,
  data: {
    title: string;
    description: string;
    description_md?: string;
    type: TaskType;
    priority: number;
    tags?: string[];
    due_at?: string;
  },
): Promise<CreateTaskResponse> {
  const requestBody: CreateTaskRequest = {
    title: data.title,
    description: data.description,
    description_md: data.description_md,
    type: mapTaskTypeToApiType(data.type),
    source: "MCP",
    status: "todo",
    priority: data.priority,
    tags: data.tags,
    due_at: data.due_at,
  };

  console.log("[API] 태스크 생성 요청 시작");
  console.log("[API] Project ID:", projectId);
  console.log("[API] 요청 URL:", `/api/v1/projects/${projectId}/tasks`);
  console.log("[API] 요청 Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await apiClient.post<CreateTaskResponse>(
      `/api/v1/projects/${projectId}/tasks`,
      requestBody,
    );

    console.log("[API] 태스크 생성 성공");
    console.log("[API] 응답 Status:", response.status);
    console.log("[API] 응답 Data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[API] 태스크 생성 실패");
    console.error("[API] 에러 상세:", axiosError);
    if (axiosError.response) {
      console.error("[API] 응답 Status:", axiosError.response.status);
      console.error("[API] 응답 Data:", axiosError.response.data);
    } else if (axiosError.request) {
      console.error("[API] 요청은 전송되었으나 응답을 받지 못함");
      console.error("[API] 요청 정보:", axiosError.request);
    } else {
      console.error("[API] 요청 설정 중 에러:", axiosError.message);
    }
    throw axiosError;
  }
}
