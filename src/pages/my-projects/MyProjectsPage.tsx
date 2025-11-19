import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { listProjects } from "../mcp/services/mcpService";
import type { ProjectMcpStatus } from "../mcp/types";
import { Search, FolderOpen, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectMcpStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  // 프로젝트 목록 불러오기
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await listProjects();
        setProjects(data);
      } catch (error) {
        console.error("[MyProjectsPage] 프로젝트 목록 조회 실패:", error);
        toast({
          title: "프로젝트 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // 검색 필터링
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return project.name.toLowerCase().includes(query);
  });

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (projectId: string) => {
    router.navigate({
      to: "/task",
      search: (prev) => ({
        ...(prev ?? {}),
        projectId,
      }),
    });
  };

  // MCP 상태 뱃지 컴포넌트
  const McpStatusBadge = ({
    status,
  }: {
    status: ProjectMcpStatus["mcpStatus"];
  }) => {
    const statusConfig: Record<
      ProjectMcpStatus["mcpStatus"],
      {
        label: string;
        icon: typeof CheckCircle2;
        className: string;
      }
    > = {
      connected: {
        label: "연결됨",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700 border-green-300",
      },
      pending: {
        label: "대기 중",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      },
      None: {
        label: "미연결",
        icon: XCircle,
        className: "bg-gray-100 text-gray-700 border-gray-300",
      },
    };

    const config = statusConfig[status] ?? statusConfig.None;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
          </h3>
          <p className="text-gray-600 text-center">
            {searchQuery
              ? "다른 검색어로 시도해보세요."
              : "새 프로젝트를 생성하여 시작하세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
            >
              {/* 프로젝트 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    프로젝트 ID: {project.id}
                  </p>
                </div>
              </div>

              {/* MCP 상태 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">MCP 상태:</span>
                  <McpStatusBadge status={project.mcpStatus} />
                </div>
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
    </div>
  );
}
