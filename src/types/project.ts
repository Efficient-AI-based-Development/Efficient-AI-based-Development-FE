// 프로젝트 상태 타입
export type ProjectStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "archived";

// 프로젝트 정보
export interface Project {
  id: number;
  project_idx: string;
  title: string;
  content_md?: string;
  content_md_json?: Record<string, unknown>;
  status: ProjectStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string; // 삭제된 경우에만 존재
}

// 프로젝트 목록 조회 응답
export interface ListProjectsResponse {
  projects: Project[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}
