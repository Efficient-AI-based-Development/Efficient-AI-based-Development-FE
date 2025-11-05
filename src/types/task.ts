export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskType = "DEV" | "DESIGN" | "DOCS";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  typeNumber: number;
  status: TaskStatus;
  priority: number; // 중요도 (0-10)
  content?: string; // 마크다운 상세 내용
  taskCode?: string; // 작업 코드 (예: "T-001")
  // 선택 타임스탬프 필드 (인사이트/히스토리용)
  createdAt?: string;
  updatedAt?: string;
  qaApprovedAt?: string; // DONE 전환 시점
}

export interface TaskStats {
  totalTasks: number;
  completionRate: number;
}
