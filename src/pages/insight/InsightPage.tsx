import { useEffect, useMemo, useState } from "react";
import KpiCard from "./components/KpiCard";
import LinkCard from "./components/LinkCard";
import {
  computeMetrics,
  diffNumber,
  formatDOffset,
  formatKoreanDate,
  formatPercent,
  getSnapshot,
  saveDailySnapshot,
  toKstDateKey,
  getYesterdayKey,
} from "./insightMetrics";
import type { Task } from "../../types/task";
import { useNavigate } from "@tanstack/react-router";

export default function InsightPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 태스크 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        const data = (await res.json()) as Task[];
        setTasks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const { todayKey, yesterdayKey } = useMemo(() => {
    return { todayKey: toKstDateKey(), yesterdayKey: getYesterdayKey() };
  }, []);

  // 지표 계산 및 스냅샷 저장/불러오기
  const { today, yesterday } = useMemo(() => {
    const m = computeMetrics(tasks);
    const today = { dateKey: todayKey, ...m };
    // 오늘 스냅샷 저장
    if (!loading) {
      saveDailySnapshot(today);
    }
    // 어제 스냅샷 조회
    const y = getSnapshot(yesterdayKey) ?? null;
    return { today, yesterday: y };
  }, [tasks, loading, todayKey, yesterdayKey]);

  const completionDelta = diffNumber(
    Number(today.completionRate.toFixed(1)),
    yesterday?.completionRate ?? null,
  );
  const qaDelta = diffNumber(today.qaDoneCount, yesterday?.qaDoneCount ?? null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold">프로젝트 인사이트</h1>
      <p className="mt-2 text-gray-600">결과물은 로컬에서 확인하세요!</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title="Task 완료율"
          value={loading ? "-" : formatPercent(today.completionRate, 0)}
          sub={
            loading
              ? "전일 대비 -"
              : completionDelta
                ? `전일 대비 ${completionDelta.sign}${completionDelta.value}%`
                : "전일 대비 -"
          }
        />
        <KpiCard
          title="마지막 진행 날짜"
          value={loading ? "-" : formatDOffset(today.lastProgressAt)}
          sub={loading ? "-" : formatKoreanDate(today.lastProgressAt)}
        />
        <KpiCard
          title="QA 통과 Task"
          value={loading ? "-" : today.qaDoneCount}
          sub={
            loading
              ? "전일 대비 -"
              : qaDelta
                ? `전일 대비 ${qaDelta.sign}${qaDelta.value}`
                : "전일 대비 -"
          }
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <LinkCard
          subtitle="PRD, SRS, User Story"
          title="문서 보러가기"
          onClick={() => navigate({ to: "/document" })}
        />
        <LinkCard
          subtitle="AI와 채팅하며"
          title="Task 추가하기"
          onClick={() => navigate({ to: "/task?new=1" })}
        />
        <LinkCard
          subtitle="서비스 이용방법"
          title="How To Use"
          onClick={() => navigate({ to: "/guide" })}
        />
      </div>
    </div>
  );
}
