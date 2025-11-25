import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { listProjects } from "../mcp/services/mcpService";
import type { ProjectMcpStatus } from "../mcp/types";

export default function ProjectSettingPage() {
  const [activeTab, setActiveTab] = useState<"general" | "mcp">("general");
  const [project, setProject] = useState<ProjectMcpStatus | null>(null);
  const { toast } = useToast();

  // 프로젝트 정보
  const PROJECT_ID = "1"; // TODO: 실제 프로젝트 ID로 변경 필요

  // 프로젝트 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = await listProjects();
        const currentProject = projects.find((p) => p.id === PROJECT_ID);
        if (currentProject) {
          setProject(currentProject);
        }
      } catch (error) {
        console.error("[ProjectSetting] 데이터 로드 실패:", error);
        toast({
          title: "데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [PROJECT_ID, toast]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">프로젝트 설정</h1>

        {/* 탭 버튼 */}
        <div className="bg-gray-100 rounded-lg p-1 flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            일반 설정
          </button>
          <button
            onClick={() => setActiveTab("mcp")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "mcp"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            MCP 설정
          </button>
        </div>

        {/* 일반 설정 탭 */}
        {activeTab === "general" && (
          <div className="bg-white border border-gray-300 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              일반 설정
            </h2>
            <p className="text-gray-600">일반 설정 내용이 여기에 표시됩니다.</p>
          </div>
        )}

        {/* MCP 설정 탭 */}
        {activeTab === "mcp" && (
          <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              MCP 연결 상태
            </h2>
            {project && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">프로젝트:</span>
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">상태:</span>
                  <span
                    className={`font-medium ${
                      project.mcpStatus === "connected"
                        ? "text-green-600"
                        : project.mcpStatus === "pending"
                          ? "text-yellow-600"
                          : "text-gray-600"
                    }`}
                  >
                    {project.mcpStatus === "connected"
                      ? "연결됨"
                      : project.mcpStatus === "pending"
                        ? "대기 중"
                        : "연결 없음"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
