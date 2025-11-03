export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskType = "DEV" | "DESIGN" | "DOCS";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  typeNumber: number;
  status: TaskStatus;
  priority: number; // 중요도 (1-10)
  content?: string; // 마크다운 상세 내용
  taskCode?: string; // 작업 코드 (예: "T-001")
  order: number; // 컬럼 내 순서
}

export interface TaskStats {
  totalTasks: number;
  completionRate: number;
}
