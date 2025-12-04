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
 * DEV → "dev", DESIGN → "design", DOCS → "docs"
 */
export function mapTaskTypeToApiType(taskType: TaskType): ApiTaskType {
  const mapping: Record<TaskType, ApiTaskType> = {
    DEV: "dev",
    DESIGN: "design",
    DOCS: "docs",
  };
  return mapping[taskType];
}

/**
 * API 타입을 TaskType으로 변환
 * "dev" → DEV, "design" → DESIGN, "docs" → DOCS
 */
export function mapApiTypeToTaskType(apiType: ApiTaskType): TaskType {
  const mapping: Record<ApiTaskType, TaskType> = {
    dev: "DEV",
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
 * 페이지네이션 없이 전체 반환
 */
export async function getTasks(
  projectId: number,
  options?: {
    q?: string;
  },
): Promise<ListTasksResponse> {
  const params = new URLSearchParams();
  if (options?.q) {
    params.append("q", options.q);
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

/**
 * 태스크 인사이트 조회 API 호출
 * GET /api/v1/tasks/insights
 */
export async function getTaskInsights(): Promise<unknown> {
  const url = `/api/v1/tasks/insights`;

  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Task Service] 태스크 인사이트 조회 실패:", axiosError);
    throw axiosError;
  }
}

/**
 * 개발 시작 API 호출
 * POST /api/v1/tasks/{task_id}/start-development
 * runId/sessionId 반환
 */
export async function startDevelopment(
  taskId: number,
  data?: {
    provider_id?: "chatgpt" | "claude" | "cursor";
    options?: {
      mode?: string;
      temperature?: number;
    };
  },
): Promise<{
  runId: string;
  sessionId: string;
  status?: string;
  preview?: string;
  summary?: string | null;
}> {
  const url = `/api/v1/tasks/${taskId}/start-development`;

  try {
    const response = await apiClient.post(url, data || {});
    // API 응답에서 runId/sessionId 추출 (응답 형식에 따라 조정 필요)
    const responseData = response.data?.data || response.data;
    return {
      runId:
        responseData.runId ||
        responseData.run_id ||
        responseData.data?.runId ||
        responseData.data?.run_id ||
        "",
      sessionId:
        responseData.sessionId ||
        responseData.session_id ||
        responseData.data?.sessionId ||
        responseData.data?.session_id ||
        "",
      status: responseData.status || responseData.data?.status,
      preview: responseData.preview || responseData.data?.preview,
      summary: responseData.summary || responseData.data?.summary,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Task Service] 개발 시작 실패:", axiosError);
    throw axiosError;
  }
}

/**
 * 개발 시작 명령어 조회 API 호출
 * GET /api/v1/tasks/{task_id}/start-development/command
 * 터미널에 붙여넣을 curl 명령어 제공
 */
export async function getStartDevelopmentCommand(
  taskId: number,
  providerId?: string,
): Promise<{
  command: string; // curl 명령어
  taskId: number;
  taskTitle?: string;
  description?: string;
  note?: string;
}> {
  const url = `/api/v1/tasks/${taskId}/start-development/command`;
  const params = providerId ? { provider_id: providerId } : {};

  try {
    const response = await apiClient.get(url, { params });
    // API 응답 형식에 따라 조정
    const responseData = response.data?.data || response.data;
    return {
      command: responseData.command || responseData.curl || "",
      taskId: responseData.taskId || responseData.task_id || taskId,
      taskTitle: responseData.taskTitle || responseData.task_title,
      description: responseData.description,
      note: responseData.note || responseData.description,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[Task Service] 개발 시작 명령어 조회 실패:", axiosError);
    throw axiosError;
  }
}
