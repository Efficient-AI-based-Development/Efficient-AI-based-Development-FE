import { useState, useRef, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AssistantType = "Cursor" | "Claude" | "ChatGPT";

const ASSISTANTS: AssistantType[] = ["Cursor", "Claude", "ChatGPT"];

export default function McpPage() {
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantType | null>(null);
  const [isAssistantDropdownOpen, setIsAssistantDropdownOpen] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // TODO: API에서 프로젝트 정보 가져오기
  const projectName = "종합설계프로젝트 1팀";

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAssistantDropdownOpen(false);
      }
    }

    if (isAssistantDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAssistantDropdownOpen]);

  const handleAssistantSelect = (assistant: AssistantType) => {
    setSelectedAssistant(assistant);
    setIsAssistantDropdownOpen(false);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "복사되었습니다!",
    });
  };

  const handleComplete = () => {
    if (selectedAssistant && !showCommands) {
      setShowCommands(true);
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen p-8 pt-6">
      <div className="max-w-7xl mx-auto">
        {/* 프로젝트명과 대시보드 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2"
            onClick={() => router.navigate({ to: "/task" })}
          >
            태스크 관리
          </Button>
        </div>

        {/* 상태별 컨텐츠 영역 */}
        <div className="border border-gray-300 rounded-lg p-20 mb-8 min-h-[500px] flex flex-col items-center justify-center bg-white">
          {!showCommands ? (
            // 초기 상태 - AI assistant 선택
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                프로젝트를 연동하세요
              </h2>
              <p className="text-gray-600 mb-6 text-base">
                터미널에 복사할 명령어를 입력해주세요.
              </p>
              <div className="relative w-80 mx-auto" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsAssistantDropdownOpen(!isAssistantDropdownOpen)
                  }
                  className="w-full px-4 py-3 text-left bg-black text-white border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between"
                >
                  <span className="text-base">
                    {selectedAssistant || "사용할 AI assistant 선택하기"}
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>

                {isAssistantDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {ASSISTANTS.map((assistant) => (
                      <button
                        key={assistant}
                        onClick={() => handleAssistantSelect(assistant)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-base"
                      >
                        {assistant}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-2 h-6">
                {selectedAssistant && (
                  <p className="text-gray-600 text-sm">
                    완료 버튼을 눌러 CLI 명령어를 확인하세요.
                  </p>
                )}
              </div>
            </div>
          ) : (
            // CLI 명령어 표시
            <div className="w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                다음 명령어를 터미널에서 실행하세요:
              </h2>

              <div className="space-y-4">
                {/* 첫 번째 명령어 */}
                <div
                  className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer"
                  onClick={() => handleCopyCommand("npm i -g @atrina/cli")}
                >
                  <div className="flex items-center justify-between">
                    <code>npm i -g @atrina/cli</code>
                    <button
                      onClick={() => handleCopyCommand("npm i -g @atrina/cli")}
                      className="ml-4 p-2 hover:bg-gray-800 rounded transition-colors"
                      aria-label="복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 두 번째 명령어 */}
                <div
                  className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm cursor-pointer"
                  onClick={() => handleCopyCommand("atrina init HVN9")}
                >
                  <div className="flex items-center justify-between">
                    <code>atrina init HVN9</code>
                    <button
                      onClick={() => handleCopyCommand("atrina init HVN9")}
                      className="ml-4 p-2 hover:bg-gray-800 rounded transition-colors"
                      aria-label="복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-base text-gray-600 text-center">
                <p>
                  위 명령어를 터미널에서 순서대로 실행한 후, 완료 버튼을
                  클릭하세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 완료 버튼 */}
        <div className="flex justify-end">
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleComplete}
            disabled={!selectedAssistant}
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}
