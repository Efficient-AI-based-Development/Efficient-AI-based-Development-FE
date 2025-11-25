import apiClient from "@/services/api";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  ListTasksResponse,
  GetTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  ApiTaskType,
  ApiTaskStatus,
  ApiTaskItem,
} from "@/types/task";
import type { TaskType, TaskStatus, Task } from "@/types/task";
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
 * API 타입을 TaskType으로 변환
 * "feat" → DEV, "design" → DESIGN, "docs" → DOCS
 */
export function mapApiTypeToTaskType(apiType: ApiTaskType): TaskType {
  const mapping: Record<ApiTaskType, TaskType> = {
    feat: "DEV",
    design: "DESIGN",
    docs: "DOCS",
  };
  return mapping[apiType];
}

/**
 * API Status를 TaskStatus로 변환
 * "todo" → TODO, "in_progress" → IN_PROGRESS, "review" → REVIEW, "done" → DONE
 */
export function mapApiStatusToTaskStatus(apiStatus: ApiTaskStatus): TaskStatus {
  const mapping: Record<ApiTaskStatus, TaskStatus> = {
    todo: "TODO",
    in_progress: "IN_PROGRESS",
    review: "REVIEW",
    done: "DONE",
  };
  return mapping[apiStatus];
}

/**
 * API TaskItem을 프론트엔드 Task 형식으로 변환
 */
export function mapApiTaskToTask(apiTask: ApiTaskItem): Task {
  return {
    id: String(apiTask.id),
    title: apiTask.title,
    type: mapApiTypeToTaskType(apiTask.type),
    typeNumber: 1, // TODO: 타입별로 계산 필요
    status: mapApiStatusToTaskStatus(apiTask.status),
    priority: apiTask.priority,
    content: apiTask.description_md || apiTask.description,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
    resultFiles: apiTask.result_files,
    summary: apiTask.summary,
    duration: apiTask.duration,
    resultLogs: apiTask.result_logs,
  };
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

  try {
    const response = await apiClient.post<CreateTaskResponse>(
      `/api/v1/projects/${projectId}/tasks`,
      requestBody,
    );

    return response.data;
  } catch (error) {
    throw error as AxiosError;
  }
}

/**
 * 태스크 목록 조회 API 호출
 * GET /api/v1/projects/{project_id}/tasks
 */
export async function getTasks(
  projectId: number,
  options?: {
    q?: string;
    page?: number;
    page_size?: number;
  },
): Promise<ListTasksResponse> {
  const params = new URLSearchParams();
  if (options?.q) {
    params.append("q", options.q);
  }
  if (options?.page) {
    params.append("page", String(options.page));
  }
  if (options?.page_size) {
    params.append("page_size", String(options.page_size));
  }

  const queryString = params.toString();
  const url = `/api/v1/projects/${projectId}/tasks${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await apiClient.get<ListTasksResponse>(url);

    return response.data;
  } catch (error) {
    throw error as AxiosError;
  }
}

/**
 * 태스크 상세 조회 API 호출
 * GET /api/v1/tasks/{task_id}
 */
export async function getTask(taskId: number): Promise<GetTaskResponse> {
  const url = `/api/v1/tasks/${taskId}`;

  try {
    const response = await apiClient.get<GetTaskResponse>(url);

    return response.data;
  } catch (error) {
    throw error as AxiosError;
  }
}

/**
 * 태스크 수정 API 호출
 * PATCH /api/v1/tasks/{task_id}
 */
export async function updateTask(
  taskId: number,
  data: UpdateTaskRequest,
): Promise<UpdateTaskResponse> {
  const url = `/api/v1/tasks/${taskId}`;

  // type이 TaskType인 경우 API 타입으로 변환
  const requestBody: UpdateTaskRequest = { ...data };
  if (
    data.type &&
    typeof data.type === "string" &&
    ["DEV", "DESIGN", "DOCS"].includes(data.type)
  ) {
    requestBody.type = mapTaskTypeToApiType(data.type as TaskType);
  }

  // status가 TaskStatus인 경우 API status로 변환
  if (
    data.status &&
    typeof data.status === "string" &&
    ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(data.status)
  ) {
    const statusMapping: Record<string, ApiTaskStatus> = {
      TODO: "todo",
      IN_PROGRESS: "in_progress",
      REVIEW: "review",
      DONE: "done",
    };
    requestBody.status = statusMapping[data.status];
  }

  try {
    const response = await apiClient.patch<UpdateTaskResponse>(
      url,
      requestBody,
    );

    return response.data;
  } catch (error) {
    throw error as AxiosError;
  }
}

/**
 * 태스크 삭제 API 호출
 * DELETE /api/v1/tasks/{task_id}
 */
export async function deleteTask(taskId: number): Promise<void> {
  const url = `/api/v1/tasks/${taskId}`;

  try {
    await apiClient.delete(url);

    return;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
}
