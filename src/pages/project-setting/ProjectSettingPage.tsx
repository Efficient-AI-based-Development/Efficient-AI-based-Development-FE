import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  listProjects,
  listConnections,
  listSessions,
  createSession,
  deleteSession,
  listTools,
  listResources,
} from "../mcp/services/mcpService";
import type {
  ProjectMcpStatus,
  Connection,
  Session,
  Tool,
  Resource,
} from "../mcp/types";

export default function ProjectSettingPage() {
  const [activeTab, setActiveTab] = useState<"general" | "mcp">("general");
  const [project, setProject] = useState<ProjectMcpStatus | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 프로젝트 정보
  const PROJECT_ID = "1"; // TODO: 실제 프로젝트 ID로 변경 필요

  // 프로젝트 및 연결 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projects = await listProjects();
        const currentProject = projects.find((p) => p.id === PROJECT_ID);
        if (currentProject) {
          setProject(currentProject);
        }

        const conns = await listConnections(PROJECT_ID);
        setConnections(conns);
        if (conns.length > 0) {
          setSelectedConnectionId(conns[0].connectionId);
        }
      } catch (error) {
        console.error("[ProjectSetting] 데이터 로드 실패:", error);
        toast({
          title: "데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [PROJECT_ID, toast]);

  // 세션 목록 로드
  useEffect(() => {
    if (selectedConnectionId) {
      const fetchSessions = async () => {
        try {
          const sess = await listSessions(selectedConnectionId);
          setSessions(sess);
          if (sess.length > 0) {
            setSelectedSessionId(sess[0].sessionId);
          }
        } catch (error) {
          console.error("[ProjectSetting] 세션 목록 조회 실패:", error);
        }
      };
      fetchSessions();
    }
  }, [selectedConnectionId]);

  // 툴 및 리소스 로드
  useEffect(() => {
    if (selectedSessionId) {
      const fetchToolsAndResources = async () => {
        try {
          const [toolsData, resourcesData] = await Promise.all([
            listTools(selectedSessionId),
            listResources(selectedSessionId),
          ]);
          setTools(toolsData);
          setResources(resourcesData);
        } catch (error) {
          console.error("[ProjectSetting] 툴/리소스 목록 조회 실패:", error);
        }
      };
      fetchToolsAndResources();
    }
  }, [selectedSessionId]);

  const handleCreateSession = async () => {
    if (!selectedConnectionId || !project) return;

    try {
      setIsLoading(true);
      const session = await createSession({
        connectionId: selectedConnectionId,
        projectId: project.id,
      });
      setSessions([...sessions, session]);
      setSelectedSessionId(session.sessionId);
      toast({
        title: "세션이 생성되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error("[ProjectSetting] 세션 생성 실패:", error);
      toast({
        title: "세션 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setTools([]);
        setResources([]);
      }
      toast({
        title: "세션이 종료되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error("[ProjectSetting] 세션 종료 실패:", error);
      toast({
        title: "세션 종료에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="space-y-6">
            {/* 연결 상태 */}
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
              {connections.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    연결 목록
                  </h3>
                  <div className="space-y-2">
                    {connections.map((conn) => (
                      <div
                        key={conn.connectionId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{conn.providerId}</div>
                          <div className="text-sm text-gray-600">
                            {conn.connectionId}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            conn.status === "active"
                              ? "text-green-600"
                              : conn.status === "pending"
                                ? "text-yellow-600"
                                : "text-gray-600"
                          }`}
                        >
                          {conn.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 세션 관리 */}
            <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  세션 관리
                </h2>
                {selectedConnectionId && (
                  <Button
                    onClick={handleCreateSession}
                    disabled={isLoading}
                    className="bg-black text-white hover:bg-black/90"
                  >
                    새 세션 생성
                  </Button>
                )}
              </div>
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{session.sessionId}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(session.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            session.status === "active"
                              ? "text-green-600"
                              : session.status === "ready"
                                ? "text-blue-600"
                                : "text-gray-600"
                          }`}
                        >
                          {session.status}
                        </span>
                        <Button
                          onClick={() => handleDeleteSession(session.sessionId)}
                          variant="outline"
                          size="sm"
                        >
                          종료
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  세션이 없습니다. 새 세션을 생성하세요.
                </p>
              )}
            </div>

            {/* 툴 목록 */}
            {selectedSessionId && (
              <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  사용 가능한 툴
                </h2>
                {tools.length > 0 ? (
                  <div className="space-y-2">
                    {tools.map((tool, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{tool.name}</div>
                        {tool.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {tool.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    사용 가능한 툴이 없습니다.
                  </p>
                )}
              </div>
            )}

            {/* 리소스 목록 */}
            {selectedSessionId && (
              <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  사용 가능한 리소스
                </h2>
                {resources.length > 0 ? (
                  <div className="space-y-2">
                    {resources.map((resource, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {resource.uri}
                        </div>
                        {resource.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {resource.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    사용 가능한 리소스가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
