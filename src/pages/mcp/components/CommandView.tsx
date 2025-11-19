import { Copy } from "lucide-react";
import type { ProviderGuideResponse } from "../types";

interface CommandViewProps {
  onCopyCommand: (command: string) => void;
  guide: ProviderGuideResponse | null;
  providerName?: string;
  projectId?: string;
}

export default function CommandView({
  onCopyCommand,
  guide,
  providerName,
  projectId,
}: CommandViewProps) {
  // 가이드가 없으면 기본 메시지 표시
  if (!guide) {
    return (
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          가이드를 불러오는 중...
        </h2>
      </div>
    );
  }

  // 현재 OS 감지 (간단한 방법)
  const currentOS =
    navigator.platform.toLowerCase().includes("mac") ||
    navigator.platform.toLowerCase().includes("darwin")
      ? "macOS"
      : navigator.platform.toLowerCase().includes("win")
        ? "Windows"
        : "Linux";

  // 현재 OS에 맞는 플랫폼 가이드 찾기
  const platformGuide =
    guide.platforms.find(
      (p) => p.os.toLowerCase() === currentOS.toLowerCase(),
    ) || guide.platforms[0]; // 없으면 첫 번째 플랫폼 사용

  // Provider ID 매핑 (providerName -> providerId)
  const getProviderId = (name?: string): string => {
    const mapping: Record<string, string> = {
      ChatGPT: "chatgpt",
      Claude: "claude",
      Cursor: "cursor",
    };
    return mapping[name || ""] || "cursor";
  };

  const providerId = getProviderId(providerName);

  // 프로젝트 ID가 없으면 에러 표시
  if (!projectId) {
    return (
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          프로젝트 정보를 불러올 수 없습니다.
        </h2>
        <p className="text-gray-600 text-sm">프로젝트 ID가 필요합니다.</p>
      </div>
    );
  }

  const initCommand = `fastmcp init --provider ${providerId} --project ${projectId}`;

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {guide.providerName} 연동 가이드
      </h2>

      {/* fastmcp init 명령어 */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          프로젝트 연동 명령어
        </h3>
        <p className="text-xs text-blue-700 mb-2">
          아래 명령어를 실행하여 이 프로젝트에 MCP를 연동하세요.
        </p>
        <div
          className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => onCopyCommand(initCommand)}
        >
          <div className="flex items-center justify-between">
            <code className="break-all">{initCommand}</code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyCommand(initCommand);
              }}
              className="ml-4 p-2 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
              aria-label="복사"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 사전 준비 사항 */}
      {guide.prerequisites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            사전 준비 사항
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {guide.prerequisites.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 단계별 가이드 */}
      <div className="space-y-6 mb-6">
        {platformGuide.steps.map((step, stepIdx) => (
          <div key={stepIdx} className="border-l-4 border-gray-300 pl-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            {step.description && (
              <p className="text-sm text-gray-600 mb-3">{step.description}</p>
            )}
            <div className="space-y-2">
              {step.commands
                .filter((cmd) => !cmd.text.includes("fastmcp run"))
                .map((cmd, cmdIdx) => (
                  <div
                    key={cmdIdx}
                    className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => onCopyCommand(cmd.text)}
                  >
                    <div className="flex items-center justify-between">
                      <code className="break-all">{cmd.text}</code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyCommand(cmd.text);
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

      <div className="mt-6 text-base text-gray-600 text-center">
        <p>
          위 명령어를 터미널에서 순서대로 실행한 후, 완료 버튼을 클릭하세요.
        </p>
      </div>
    </div>
  );
}
