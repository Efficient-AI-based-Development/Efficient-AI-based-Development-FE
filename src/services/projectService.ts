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
    console.error(
      "[ProjectService] 응답 Data (상세):",
      JSON.stringify(axiosError.response.data, null, 2),
    );
    console.error(
      "[ProjectService] 요청 URL:",
      axiosError.config?.url,
      "파라미터:",
      axiosError.config?.params,
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
  // 백엔드가 page_size를 기대할 수 있으므로 둘 다 시도
  // 백엔드 최소값 요구사항: 10 이상
  if (typeof options.pageSize === "number" && options.pageSize >= 10) {
    params.pageSize = options.pageSize;
    params.page_size = options.pageSize; // 백엔드가 snake_case를 기대할 수 있음
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
