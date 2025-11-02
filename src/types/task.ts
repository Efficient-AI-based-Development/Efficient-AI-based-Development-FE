export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskType = "DEV" | "DESIGN" | "DOCS";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  typeNumber: number;
  status: TaskStatus;
  priority: number; // 중요도 (1-10)
}

export interface TaskStats {
  totalTasks: number;
  completionRate: number;
}
