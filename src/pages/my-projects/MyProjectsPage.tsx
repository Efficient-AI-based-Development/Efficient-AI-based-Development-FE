import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { listProjects } from "@/services/projectService";
import type {
  ListProjectsResponse,
  Project,
  ProjectStatus,
} from "@/types/project";
import {
  Archive,
  CheckCircle2,
  Clock,
  FolderOpen,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    project_idx: "DEMO-001",
    title: "샘플 프로젝트 A",
    status: "in_progress",
    owner_id: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    project_idx: "DEMO-002",
    title: "샘플 프로젝트 B",
    status: "not_started",
    owner_id: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    project_idx: "DEMO-003",
    title: "샘플 프로젝트 C",
    status: "completed",
    owner_id: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const buildMockResponse = (): ListProjectsResponse => ({
  projects: MOCK_PROJECTS,
  meta: {
    page: 1,
    page_size: MOCK_PROJECTS.length,
    total: MOCK_PROJECTS.length,
  },
});

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<ListProjectsResponse["meta"]>({
    page: 1,
    page_size: 9,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<
    "missing-token" | "api-error" | null
  >(null);
  const router = useRouter();
  const { toast } = useToast();
  const PAGE_SIZE = 9;
  const devModeEnabled = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("devMode") === "true"
        : false,
    [],
  );

  // 검색어 디바운스
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // 프로젝트 목록 불러오기
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // 쿠키 기반 인증 사용 (백엔드가 쿠키로 토큰을 전달)
        // withCredentials: true로 설정되어 있어 쿠키가 자동으로 전송됨
        // localStorage 토큰은 선택적으로 확인 (하위 호환성)
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : null;
        const isLoggedIn =
          typeof window !== "undefined"
            ? localStorage.getItem("isLoggedIn") === "true"
            : false;

        // devMode에서 토큰 없이 진입하면 목업 데이터 사용
        if (!token && devModeEnabled) {
          const mockResponse = buildMockResponse();
          setProjects(mockResponse.projects);
          setMeta(mockResponse.meta);
          return;
        }

        // 쿠키 기반 인증 사용 중이므로 토큰이 없어도 쿠키로 인증 시도
        // 로그인도 안 되고 devMode도 아닌 경우에만 에러 표시
        if (!isLoggedIn && !devModeEnabled && !token) {
          setProjects([]);
          setMeta((prev) => ({
            ...prev,
            total: 0,
            page,
            page_size: PAGE_SIZE,
          }));
          setAuthError("missing-token");
          return;
        }

        const response = await listProjects({
          q: debouncedSearch || undefined,
          page,
          pageSize: PAGE_SIZE,
        });

        if (!isMounted) return;

        setProjects(response.projects);
        setMeta(response.meta);
        setPage(response.meta.page);
      } catch (error) {
        console.error("[MyProjectsPage] 프로젝트 목록 조회 실패:", error);

        const axiosError = error as {
          response?: { status?: number };
        };

        if (
          (axiosError.response?.status === 401 ||
            axiosError.response?.status === 403) &&
          devModeEnabled
        ) {
          const mockResponse = buildMockResponse();
          setProjects(mockResponse.projects);
          setMeta(mockResponse.meta);
        } else {
          setAuthError("api-error");
        }

        toast({
          title: "프로젝트 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [PAGE_SIZE, debouncedSearch, page, toast]);

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (projectId: number) => {
    localStorage.setItem("currentProjectId", String(projectId));
    router.navigate({
      to: "/task",
      search: (prev) => ({
        ...(prev ?? {}),
        projectId: String(projectId),
      }),
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const totalPages =
    meta.page_size > 0
      ? Math.max(1, Math.ceil(meta.total / meta.page_size))
      : 1;
  const currentPage = meta.page || page;

  const handleNextPage = () => {
    if (currentPage >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  // 프로젝트 상태 뱃지
  const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
    const statusConfig: Record<
      ProjectStatus,
      { label: string; icon: typeof CheckCircle2; className: string }
    > = {
      not_started: {
        label: "시작 전",
        icon: Clock,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      },
      in_progress: {
        label: "진행 중",
        icon: RefreshCw,
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      completed: {
        label: "완료됨",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700 border-green-200",
      },
      archived: {
        label: "보관됨",
        icon: Archive,
        className: "bg-gray-100 text-gray-600 border-gray-200",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </div>
    );
  };

  const hasSearch = Boolean(debouncedSearch);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (authError === "missing-token") {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          로그인이 필요합니다
        </h1>
        <p className="text-gray-600 max-w-md">
          프로젝트 목록을 확인하려면 구글 로그인을 완료해주세요. 로그인 후
          자동으로 프로젝트 정보를 불러옵니다.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.navigate({ to: "/login" })}>
            로그인 페이지로 이동
          </Button>
          <Button
            variant="outline"
            onClick={() => router.navigate({ to: "/document/setting1" })}
          >
            프로젝트 생성 가이드 보기
          </Button>
        </div>
      </div>
    );
  }

  const showFallbackNotice = authError === "api-error";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 헤더 + 검색 */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            내 프로젝트 관리
          </h1>
          <p className="text-gray-600">프로젝트 목록을 확인하고 관리하세요.</p>
        </div>
        <div className="relative w-full max-w-sm self-end md:self-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="프로젝트 이름으로 검색..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {showFallbackNotice && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900">
          서버 인증 정보가 없어 목업 데이터를 대신 표시하고 있습니다. 실제
          데이터를 확인하려면 로그인 후 다시 시도해주세요.
        </div>
      )}

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {hasSearch ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
          </h3>
          <p className="text-gray-600 text-center">
            {hasSearch
              ? "다른 검색어로 시도해보세요."
              : "새 프로젝트를 생성하여 시작하세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
            >
              {/* 프로젝트 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    프로젝트 ID: {project.id}
                  </p>
                </div>
              </div>

              {/* 프로젝트 상태 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <ProjectStatusBadge status={project.status} />
                <div className="text-gray-400 group-hover:text-primary transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          총 {meta.total.toLocaleString()}개의 프로젝트 · 페이지 {currentPage} /{" "}
          {totalPages}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || projects.length === 0}
            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
