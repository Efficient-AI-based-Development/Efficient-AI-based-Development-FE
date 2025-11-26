import apiClient from "@/services/api";
import type { ListProjectsResponse } from "@/types/project";
import type { AxiosError } from "axios";

const BASE_PATH = "/api/v1/projects";

type ListProjectsOptions = {
  q?: string;
  page?: number;
  pageSize?: number;
};

function logAxiosError(context: string, error: unknown) {
  const axiosError = error as AxiosError;
  console.error(`[ProjectService] ${context} 실패`, axiosError);

  if (axiosError.response) {
    console.error("[ProjectService] 응답 Status:", axiosError.response.status);
    console.error("[ProjectService] 응답 Data:", axiosError.response.data);
    console.error(
      "[ProjectService] 응답 Headers:",
      axiosError.response.headers,
    );
  } else if (axiosError.request) {
    console.error(
      "[ProjectService] 요청은 전송되었으나 응답을 받지 못했습니다.",
      axiosError.request,
    );
  } else {
    console.error("[ProjectService] 요청 설정 중 에러:", axiosError.message);
  }
}

export async function listProjects(
  options: ListProjectsOptions = {},
): Promise<ListProjectsResponse> {
  const params: Record<string, string | number> = {};

  if (options.q?.trim()) {
    params.q = options.q.trim();
  }
  if (typeof options.page === "number") {
    params.page = options.page;
  }
  if (typeof options.pageSize === "number") {
    params.pageSize = options.pageSize;
  }

  try {
    const response = await apiClient.get<ListProjectsResponse>(BASE_PATH, {
      params,
    });
    return response.data;
  } catch (error) {
    logAxiosError("프로젝트 목록 조회", error);
    throw error;
  }
}
