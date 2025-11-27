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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";
import type { ProjectMcpStatus, AssistantType } from "./types";
import { mapAssistantToProvider } from "./types";
import {
  listProjects,
  createConnection,
  getProjectConfigFile,
} from "./services/mcpService";

export default function McpPage() {
  const [project, setProject] = useState<ProjectMcpStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantType>("Cursor");
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configFile, setConfigFile] = useState<{
    configContent: string;
    fileName: string;
    installPath: string;
    instructions: string[];
  } | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
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

  // 현재 OS 감지
  const getCurrentOS = (): string => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("mac") || platform.includes("darwin")) {
      return "macOS";
    } else if (platform.includes("win")) {
      return "Windows";
    } else {
      return "Linux";
    }
  };

  // 설정 파일 다운로드 핸들러
  const handleDownloadConfigFile = async () => {
    if (!project) {
      toast({
        title: "프로젝트 정보가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingConfig(true);
      const providerId = mapAssistantToProvider(selectedAssistant);
      const currentOS = getCurrentOS();

      // API 토큰 가져오기 (localStorage에서)
      const apiToken =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        "";

      const config = await getProjectConfigFile(Number(project.id), {
        providerId,
        apiToken,
        os: currentOS,
      });

      setConfigFile(config);
      setIsConfigDialogOpen(true);
    } catch (error) {
      console.error("[McpPage] 설정 파일 생성 실패:", error);
      toast({
        title: "설정 파일 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // 설정 파일 내용 복사
  const handleCopyConfigContent = () => {
    if (!configFile) return;
    navigator.clipboard.writeText(configFile.configContent);
    toast({
      title: "설정 파일 내용이 복사되었습니다!",
      description: configFile.installPath,
      duration: 5000,
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

  // 프로젝트 ID가 없으면 에러 표시
  if (!project?.id) {
    return (
      <div className="min-h-screen p-8 pt-8 flex items-center justify-center">
        <div className="text-gray-600">프로젝트 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

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

        {/* MCP 연결 설정 안내 */}
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            MCP 연결 설정
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            아래 버튼을 클릭하여 MCP 설정 파일을 생성하고 Cursor에 연동하세요.
            자동으로 토큰이 포함된 설정 파일이 생성됩니다.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 설정 파일을 생성하면 자동으로 토큰이
              포함되어 있어 별도로 토큰을 입력할 필요가 없습니다.
            </p>
          </div>

          <div className="flex justify-start gap-3">
            <Button
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownloadConfigFile}
              disabled={isLoadingConfig}
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoadingConfig ? "생성 중..." : "MCP 설정 파일 다운로드"}
            </Button>
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleComplete}
            disabled={isCreatingConnection}
          >
            {isCreatingConnection ? "연결 중..." : "연결 생성 및 완료"}
          </Button>
        </div>
      </div>

      {/* 설정 파일 다이얼로그 */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              MCP 설정 파일
            </DialogTitle>
            <DialogDescription>
              아래 설정 파일 내용을 복사하여 Cursor 설정 파일에 붙여넣으세요.
            </DialogDescription>
          </DialogHeader>

          {configFile && (
            <div className="space-y-6 mt-4">
              {/* 설치 경로 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  설치 경로
                </h3>
                <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                  {configFile.installPath}
                </p>
              </div>

              {/* 설정 파일 내용 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    설정 파일 내용 ({configFile.fileName})
                  </h3>
                  <Button
                    onClick={handleCopyConfigContent}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </Button>
                </div>
                <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{configFile.configContent}</code>
                </pre>
              </div>

              {/* 설치 안내 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  설치 안내
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  {configFile.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
