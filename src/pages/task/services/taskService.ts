import apiClient from "@/services/api";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  ApiTaskType,
} from "@/types/task";
import type { TaskType } from "@/types/task";

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

  const response = await apiClient.post<CreateTaskResponse>(
    `/api/v1/projects/${projectId}/tasks`,
    requestBody,
  );

  return response.data;
}
