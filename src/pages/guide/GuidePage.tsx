import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProviderGuideResponse, ProviderId } from "../mcp/types";
import { getProviderGuide } from "../mcp/services/mcpService";

export default function GuidePage() {
  const [guide, setGuide] = useState<ProviderGuideResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId>("cursor");
  const { toast } = useToast();

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setIsLoading(true);
        const guideData = await getProviderGuide(selectedProvider);
        setGuide(guideData);
      } catch (error) {
        console.error("[GuidePage] 가이드 조회 실패:", error);
        toast({
          title: "가이드를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [selectedProvider, toast]);

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "복사되었습니다!",
      duration: 3000,
    });
  };

  // 현재 OS 감지
  const currentOS =
    navigator.platform.toLowerCase().includes("mac") ||
    navigator.platform.toLowerCase().includes("darwin")
      ? "macOS"
      : navigator.platform.toLowerCase().includes("win")
        ? "Windows"
        : "Linux";

  // 현재 OS에 맞는 플랫폼 가이드 찾기
  const platformGuide =
    guide?.platforms.find(
      (p) => p.os.toLowerCase() === currentOS.toLowerCase(),
    ) || guide?.platforms[0];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-gray-600">가이드를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 제목 + AI Assistant 선택 */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-3xl font-bold text-gray-900">MCP 연동 가이드</h1>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              AI Assistant 선택
            </label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setSelectedProvider(value as ProviderId)
              }
            >
              <SelectTrigger className="w-[180px] !bg-white">
                <SelectValue placeholder="AI Assistant 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-8">
          {/* 사전 준비 사항 */}
          {guide.prerequisites.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                사전 준비 사항
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {guide.prerequisites.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 단계별 가이드 */}
          {platformGuide && (
            <div className="space-y-8">
              {platformGuide.steps
                .filter((step) => {
                  // "# 또는 직접 프롬프트"가 포함된 빈 step 제거
                  const hasEmptyPromptText =
                    step.title?.includes("# 또는 직접 프롬프트") ||
                    step.description?.includes("# 또는 직접 프롬프트");
                  const hasCommands =
                    step.commands &&
                    step.commands.filter(
                      (cmd) => !cmd.text.includes("fastmcp run"),
                    ).length > 0;
                  // "# 또는 직접 프롬프트"가 있고 명령어가 없으면 필터링
                  return !(hasEmptyPromptText && !hasCommands);
                })
                .map((step, stepIdx) => (
                  <div
                    key={stepIdx}
                    className="border-l-4 border-gray-300 pl-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    {step.description &&
                      !step.description.includes("# 또는 직접 프롬프트") && (
                        <p className="text-gray-600 mb-4">{step.description}</p>
                      )}
                    <div className="space-y-3">
                      {step.commands
                        .filter((cmd) => !cmd.text.includes("fastmcp run"))
                        .map((cmd, cmdIdx) => (
                          <div
                            key={cmdIdx}
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
                ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 간단한 방법
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              위 명령어 대신, <strong>MCP 연동 페이지</strong>에서 "설정 파일
              다운로드" 버튼을 클릭하면 자동으로 토큰이 포함된 설정 파일이
              생성됩니다. 복사-붙여넣기만 하면 됩니다!
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>MCP 연동 페이지에서 "설정 파일 다운로드" 클릭</li>
              <li>생성된 mcp.json 내용 복사</li>
              <li>Cursor 설정 파일에 붙여넣기</li>
              <li>Cursor 재시작</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
