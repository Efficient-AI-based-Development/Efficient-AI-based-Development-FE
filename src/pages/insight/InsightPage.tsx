import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCheck } from "lucide-react";
import KpiCard from "./components/KpiCard";
import LinkCard from "./components/LinkCard";
import CircularChart from "./components/CircularChart";
import {
  diffNumber,
  formatDOffset,
  formatKoreanDate,
  formatPercent,
  getSnapshot,
  saveDailySnapshot,
  toKstDateKey,
  getYesterdayKey,
} from "./insightMetrics";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getTaskInsights } from "./services/insightService";
import type { TaskInsightsResponse } from "./services/insightService";

export default function InsightPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/insight" });
  const [taskInsights, setTaskInsights] = useState<TaskInsightsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // URL에서 projectId 가져오기
  const DEFAULT_PROJECT_ID = 1;
  const parsedProjectId = search.projectId
    ? Number(search.projectId)
    : DEFAULT_PROJECT_ID;

  const PROJECT_ID = Number.isNaN(parsedProjectId)
    ? DEFAULT_PROJECT_ID
    : parsedProjectId;

  // 인사이트 데이터 불러오기
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Task 인사이트 조회
        try {
          const taskInsightsData = await getTaskInsights(PROJECT_ID);
          setTaskInsights(taskInsightsData);
        } catch (taskError: unknown) {
          // 501, 422 에러는 무시 (아직 구현되지 않았거나 유효하지 않은 API)
          const axiosError = taskError as { response?: { status?: number } };
          if (
            axiosError?.response?.status !== 501 &&
            axiosError?.response?.status !== 422
          ) {
            // 501, 422가 아닌 에러만 처리
            if (import.meta.env.DEV) {
              console.error("Task 인사이트 조회 실패:", taskError);
            }
          }
        }
      } catch (error) {
        // 에러 처리
        if (import.meta.env.DEV) {
          console.error("인사이트 데이터 조회 실패:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [PROJECT_ID]);

  const { todayKey, yesterdayKey } = useMemo(() => {
    return { todayKey: toKstDateKey(), yesterdayKey: getYesterdayKey() };
  }, []);

  // 지표 계산 및 스냅샷 저장/불러오기
  const { today, yesterday } = useMemo(() => {
    if (!taskInsights) {
      return {
        today: {
          dateKey: todayKey,
          completionRate: 0,
          qaDoneCount: 0,
          lastProgressAt: undefined,
        },
        yesterday: null,
      };
    }

    const today = {
      dateKey: todayKey,
      completionRate: taskInsights.task_completed_probability,
      qaDoneCount: taskInsights.QA_test,
      lastProgressAt: taskInsights.task_last_updated,
    };

    // 오늘 스냅샷 저장
    if (!loading) {
      saveDailySnapshot(today);
    }

    // 어제 스냅샷 조회
    const y = getSnapshot(yesterdayKey) ?? null;
    return { today, yesterday: y };
  }, [taskInsights, loading, todayKey, yesterdayKey]);

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

      {/* Project-specific KPI Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-4">
          프로젝트 상세 지표
        </h2>
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
          icon={
            loading ? (
              <div className="h-16 w-16" />
            ) : (
              <CircularChart
                value={Math.round(today.completionRate)}
                size={64}
                strokeWidth={6}
              />
            )
          }
        />
        <KpiCard
          title="마지막 진행 날짜"
          value={loading ? "-" : formatDOffset(today.lastProgressAt)}
          sub={loading ? "-" : formatKoreanDate(today.lastProgressAt)}
          icon={<Calendar className="h-16 w-16 text-primary" />}
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
          icon={<CheckCheck className="h-16 w-16 text-primary" />}
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
          onClick={() => {
            window.location.href = "/task?new=1";
          }}
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
