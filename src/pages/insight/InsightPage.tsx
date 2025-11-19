import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCheck,
  FolderKanban,
  FileText,
  Briefcase,
} from "lucide-react";
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
import { useNavigate } from "@tanstack/react-router";
import {
  getProjectInsights,
  getInsightsSummary,
} from "./services/insightService";
import type {
  InsightsResponse,
  InsightsSummaryResponse,
} from "./services/insightService";

export default function InsightPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [summary, setSummary] = useState<InsightsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO: 실제 프로젝트 ID로 변경 필요
  const PROJECT_ID = 1;

  // 인사이트 데이터 불러오기
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        console.log("[InsightPage] 인사이트 데이터 조회 시작");

        // 프로젝트 인사이트 조회 (501 에러 처리)
        try {
          const projectInsights = await getProjectInsights(PROJECT_ID);
          console.log(
            "[InsightPage] 프로젝트 인사이트 데이터 받음:",
            projectInsights,
          );
          setInsights(projectInsights);
        } catch (projectError: unknown) {
          // 501 Not Implemented 에러 처리
          const axiosError = projectError as { response?: { status?: number } };
          if (axiosError?.response?.status === 501) {
            console.warn(
              "[InsightPage] 프로젝트 인사이트 API가 아직 구현되지 않았습니다 (501)",
            );
          } else {
            console.error(
              "[InsightPage] 프로젝트 인사이트 조회 실패:",
              projectError,
            );
          }
        }

        // 전체 요약 조회 (501 에러 처리)
        try {
          const summaryData = await getInsightsSummary();
          console.log(
            "[InsightPage] 전체 인사이트 요약 데이터 받음:",
            summaryData,
          );
          setSummary(summaryData);
        } catch (summaryError: unknown) {
          // 501 Not Implemented 에러는 무시 (선택적 기능)
          const axiosError = summaryError as { response?: { status?: number } };
          if (axiosError?.response?.status === 501) {
            console.warn(
              "[InsightPage] 전체 인사이트 요약 API가 아직 구현되지 않았습니다 (501)",
            );
          } else {
            console.warn(
              "[InsightPage] 전체 인사이트 요약 조회 실패:",
              summaryError,
            );
          }
        }
      } catch (e) {
        console.error("[InsightPage] 인사이트 데이터 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const { todayKey, yesterdayKey } = useMemo(() => {
    return { todayKey: toKstDateKey(), yesterdayKey: getYesterdayKey() };
  }, []);

  // 지표 계산 및 스냅샷 저장/불러오기
  const { today, yesterday } = useMemo(() => {
    if (!insights) {
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

    // API 응답에서 지표 계산
    const completionRate =
      insights.total_tasks === 0
        ? 0
        : (insights.completed_tasks / insights.total_tasks) * 100;

    // recent_activities에서 가장 최근 활동 날짜 추출
    let lastProgressAt: string | undefined;
    if (insights.recent_activities && insights.recent_activities.length > 0) {
      // recent_activities는 문자열 배열이므로, 날짜 형식이 있다면 파싱
      // 여기서는 간단히 현재 시간을 사용하거나, API에서 제공하는 경우 그대로 사용
      // TODO: API 응답 구조에 따라 조정 필요
      lastProgressAt = new Date().toISOString();
    }

    const today = {
      dateKey: todayKey,
      completionRate,
      qaDoneCount: insights.completed_tasks,
      lastProgressAt,
    };

    // 오늘 스냅샷 저장
    if (!loading) {
      saveDailySnapshot(today);
    }

    // 어제 스냅샷 조회
    const y = getSnapshot(yesterdayKey) ?? null;
    return { today, yesterday: y };
  }, [insights, loading, todayKey, yesterdayKey]);

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

      {/* Overall Summary Section */}
      {summary && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5 md:items-stretch">
          <KpiCard
            title="전체 프로젝트"
            value={loading ? "-" : summary.total_projects}
            icon={<Briefcase className="h-16 w-16 text-primary" />}
          />
          <KpiCard
            title="활성 프로젝트"
            value={loading ? "-" : summary.active_projects}
            icon={<FolderKanban className="h-16 w-16 text-primary" />}
          />
          <KpiCard
            title="전체 Task"
            value={loading ? "-" : summary.total_tasks}
            icon={<CheckCheck className="h-16 w-16 text-primary" />}
          />
          <KpiCard
            title="전체 문서"
            value={loading ? "-" : summary.total_documents}
            icon={<FileText className="h-16 w-16 text-primary" />}
          />
          <KpiCard
            title="오늘 완료된 작업"
            value={loading ? "-" : summary.completed_jobs_today}
            icon={<Calendar className="h-16 w-16 text-primary" />}
          />
        </div>
      )}

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
