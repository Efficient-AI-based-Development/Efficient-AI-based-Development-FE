export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskType = "DEV" | "DESIGN" | "DOCS";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  typeNumber: number;
  status: TaskStatus;
  priority: number; // 중요도 (0-10)
  content?: string; // 마크다운 상세 내용 (명령어 프롬프트)
  taskCode?: string; // 작업 코드 (예: "T-001")
  // 선택 타임스탬프 필드 (인사이트/히스토리용)
  createdAt?: string;
  updatedAt?: string;
  qaApprovedAt?: string; // DONE 전환 시점
  // DONE 상태 결과 정보
  resultFiles?: string[]; // 생성/수정된 파일 목록
  summary?: string; // 작업 요약/설명
  duration?: number; // 실제 작업 소요 시간 (초)
  resultLogs?: string; // 결과 로그 (마크다운)
}

export interface TaskStats {
  totalTasks: number;
  completionRate: number;
}
