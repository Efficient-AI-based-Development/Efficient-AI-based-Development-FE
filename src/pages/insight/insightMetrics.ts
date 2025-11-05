// 인사이트 대시보드: 지표 계산 및 일자별 스냅샷 유틸리티
import type { Task } from "../../types/task";

// 내부적으로 선택 타임스탬프를 허용하기 위한 보조 타입
interface TaskWithTimestamps extends Task {
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

const STORAGE_PREFIX = "insight:metrics";

// KST 기준 일자 키(YYYYMMDD) 생성
export function toKstDateKey(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date).replaceAll("-", "");
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getYesterdayKey(base: Date = new Date()): string {
  return toKstDateKey(addDays(base, -1));
}

// 태스크 배열에서 핵심 지표 계산
export function computeMetrics(
  tasks: Task[],
): Omit<InsightMetricsSnapshot, "dateKey"> {
  const totalTasks = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const completionRate = totalTasks === 0 ? 0 : (doneCount / totalTasks) * 100;

  // 가장 최근 변경 시각: updatedAt 최대값
  const lastUpdated = tasks
    .map((t) => (t as unknown as TaskWithTimestamps).updatedAt)
    .filter(Boolean)
    .map((v) => new Date(v as string).getTime());
  const maxTs = lastUpdated.length ? Math.max(...lastUpdated) : undefined;

  return {
    completionRate,
    qaDoneCount: doneCount,
    lastProgressAt: maxTs ? new Date(maxTs).toISOString() : undefined,
  };
}

// 일자별 스냅샷 저장/조회
export function saveDailySnapshot(snapshot: InsightMetricsSnapshot): void {
  try {
    const key = `${STORAGE_PREFIX}:${snapshot.dateKey}`;
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // storage 불가 환경은 무시
  }
}

export function getSnapshot(dateKey: string): InsightMetricsSnapshot | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${dateKey}`);
    return raw ? (JSON.parse(raw) as InsightMetricsSnapshot) : null;
  } catch {
    return null;
  }
}

// 최근 N일간의 일자별 태스크 활동 수 계산
export function getRecentActivityCounts(
  tasks: Task[],
  days: number = 5,
): number[] {
  const counts: number[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const targetDate = addDays(today, -i);
    const targetDateKey = toKstDateKey(targetDate);

    // 해당 날짜에 업데이트된 태스크 수 계산
    const count = tasks.filter((task) => {
      const taskWithTimestamps = task as unknown as TaskWithTimestamps;
      if (!taskWithTimestamps.updatedAt) return false;

      const taskDate = new Date(taskWithTimestamps.updatedAt);
      const taskDateKey = toKstDateKey(taskDate);

      return taskDateKey === targetDateKey;
    }).length;

    counts.push(count);
  }

  return counts;
}

// 숫자 증감 도우미(전일 대비)
export function diffNumber(
  current: number,
  previous?: number | null,
): {
  value: number;
  sign: "+" | "-" | "=";
} | null {
  if (previous === undefined || previous === null) return null;
  const delta = current - previous;
  if (delta === 0) return { value: 0, sign: "=" };
  return { value: Math.abs(delta), sign: delta > 0 ? "+" : "-" };
}

// 마지막 진행 날짜를 D±N 포맷으로 출력(KST, 일 단위)
export function formatDOffset(lastProgressAt?: string): string {
  if (!lastProgressAt) return "-";
  const nowKstKey = toKstDateKey();
  const lastKey = toKstDateKey(new Date(lastProgressAt));

  const yyyy = Number(nowKstKey.slice(0, 4));
  const mm = Number(nowKstKey.slice(4, 6)) - 1;
  const dd = Number(nowKstKey.slice(6, 8));
  const today = new Date(Date.UTC(yyyy, mm, dd));

  const lyyyy = Number(lastKey.slice(0, 4));
  const lmm = Number(lastKey.slice(4, 6)) - 1;
  const ldd = Number(lastKey.slice(6, 8));
  const last = new Date(Date.UTC(lyyyy, lmm, ldd));

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.getTime() - last.getTime()) / msPerDay);
  if (diffDays <= 0) return "D-Day";
  return `D+${diffDays}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSigned(value: number, unit: string = ""): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}${abs}${unit}`;
}

export function formatKoreanDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // Format: "2025년 9월 22일"
  return f.format(d);
}
