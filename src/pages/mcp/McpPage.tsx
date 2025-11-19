import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import type { ProjectMcpStatus, AssistantType } from "./types";
import { mapAssistantToProvider } from "./types";
import { listProjects, createConnection } from "./services/mcpService";

export default function McpPage() {
  const [project, setProject] = useState<ProjectMcpStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantType>("Cursor");
  const router = useRouter();
  const { toast } = useToast();

  // 프로젝트 목록 가져오기
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const projects = await listProjects();
        // TODO: 실제로는 선택된 프로젝트나 URL 파라미터로 프로젝트를 가져와야 함
        // 일단 첫 번째 프로젝트 사용
        if (projects.length > 0) {
          setProject(projects[0]);
        }
      } catch (error) {
        console.error("[McpPage] 프로젝트 목록 조회 실패:", error);
        toast({
          title: "프로젝트 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [toast]);

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "복사되었습니다!",
      duration: 3000,
    });
  };

  const handleComplete = async () => {
    if (!project) {
      toast({
        title: "프로젝트 정보가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingConnection(true);
      const providerId = mapAssistantToProvider(selectedAssistant);

      // 연결 생성
      await createConnection({
        providerId,
        projectId: project.id,
      });

      toast({
        title: "연결이 생성되었습니다.",
        duration: 3000,
      });

      // 태스크 페이지로 이동
      router.navigate({ to: "/task" });
    } catch (error) {
      console.error("[McpPage] 연결 생성 실패:", error);
      toast({
        title: "연결 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConnection(false);
    }
  };

  // Provider ID 매핑
  const providerId = mapAssistantToProvider(selectedAssistant);

  // 프로젝트 ID가 없으면 에러 표시
  if (!project?.id) {
    return (
      <div className="min-h-screen p-8 pt-8 flex items-center justify-center">
        <div className="text-gray-600">프로젝트 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const commands = [
    { text: "npm i -g fastmcp-cli", label: "CLI 설치" },
    { text: "cd /path/to/project", label: "프로젝트 디렉토리로 이동" },
    {
      text: `fastmcp init --provider ${providerId} --project ${project.id}`,
      label: "프로젝트 연동",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 pt-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* 프로젝트명 + AI Assistant 선택 */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project.name} MCP 연동
            </h1>
            <p className="text-gray-600 mt-2">
              프로젝트에 MCP를 연동하여 AI Assistant와 함께 작업하세요.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              AI Assistant 선택
            </label>
            <Select
              value={selectedAssistant}
              onValueChange={(value) =>
                setSelectedAssistant(value as AssistantType)
              }
            >
              <SelectTrigger className="w-[180px] !bg-white">
                <SelectValue placeholder="AI Assistant 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cursor">Cursor</SelectItem>
                <SelectItem value="Claude">Claude</SelectItem>
                <SelectItem value="ChatGPT">ChatGPT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 프로젝트 연동 명령어 */}
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            프로젝트 연동 명령어
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            아래 명령어를 실행하여 이 프로젝트에 MCP를 연동하세요.
          </p>

          <div className="space-y-3">
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleCopyCommand(cmd.text)}
              >
                <div className="flex items-center justify-between">
                  <code className="break-all">{cmd.text}</code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCommand(cmd.text);
                    }}
                    className="ml-4 p-2 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                    aria-label="복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="flex justify-end">
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleComplete}
            disabled={isCreatingConnection}
          >
            {isCreatingConnection ? "연결 중..." : "연결 생성 및 완료"}
          </Button>
        </div>
      </div>
    </div>
  );
}
