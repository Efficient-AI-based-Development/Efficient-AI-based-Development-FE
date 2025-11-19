import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          MCP 연동 가이드
        </h1>

        {/* Provider 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AI Assistant 선택
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as ProviderId)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="cursor">Cursor</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {guide.providerName} 연동 가이드
          </h2>

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
              {platformGuide.steps.map((step, stepIdx) => (
                <div key={stepIdx} className="border-l-4 border-gray-300 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  {step.description && (
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

          {/* Cursor에서 실행 안내 */}
          {selectedProvider === "cursor" && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-base font-semibold text-blue-900 mb-2">
                3. Cursor에서 실행
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                <code className="bg-blue-100 px-2 py-1 rounded">
                  Cmd+Shift+P
                </code>{" "}
                →{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">
                  Open MCP Project
                </code>{" "}
                후 아래 명령을 실행하거나 UI 버튼을 눌러주세요. 자연어 명령어도
                지원합니다.
              </p>
            </div>
          )}

          <div className="mt-8 text-base text-gray-600 text-center">
            <p>
              위 명령어를 터미널에서 순서대로 실행한 후, 완료 버튼을 클릭하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
