import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Calendar, Target } from "lucide-react";
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
    <div className="min-h-screen bg-white px-24 pt-14">
      {/* Header with title and subtitle */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-black">
          프로젝트 인사이트
        </h1>
        <p className="mt-4 text-base text-black">
          결과물은 로컬에서 확인하세요!
        </p>
      </div>

      {/* First row: KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
        <KpiCard
          title="Task 완료율"
          value={loading ? "-" : formatPercent(today.completionRate, 0)}
          sub={
            loading
              ? "전날 대비 -"
              : completionDelta
                ? `전날 대비 ${completionDelta.sign}${completionDelta.value}%`
                : "전날 대비 -"
          }
          icon={<CheckCircle2 className="h-12 w-12 text-black" />}
        />
        <KpiCard
          title="마지막 진행 날짜"
          value={loading ? "-" : formatDOffset(today.lastProgressAt)}
          sub={loading ? "-" : formatKoreanDate(today.lastProgressAt)}
          icon={<Calendar className="h-12 w-12 text-black" />}
        />
        <KpiCard
          title="QA 통과 Task"
          value={loading ? "-" : today.qaDoneCount}
          sub={
            loading
              ? "전날 대비 -"
              : qaDelta
                ? `전날 대비 ${qaDelta.sign}${qaDelta.value}`
                : "전날 대비 -"
          }
          icon={<Target className="h-12 w-12 text-black" />}
        />
      </div>

      {/* Second row: Link Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
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
