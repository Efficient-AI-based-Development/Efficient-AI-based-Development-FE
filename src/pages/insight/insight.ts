import type { Task } from "../../types/task";

// 내부적으로 선택 타임스탬프를 허용하기 위한 보조 타입
export interface TaskWithTimestamps extends Task {
  createdAt?: string;
  updatedAt?: string;
  qaApprovedAt?: string;
}

export interface InsightMetricsSnapshot {
  dateKey: string; // KST YYYYMMDD
  completionRate: number; // 0~100
  qaDoneCount: number; // DONE 개수
  lastProgressAt?: string; // ISO 문자열
}
