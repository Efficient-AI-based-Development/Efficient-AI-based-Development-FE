import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import InitialView from "./components/InitialView";
import CommandView from "./components/CommandView";
import type { AssistantType } from "./types";

export default function McpPage() {
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantType | null>(null);
  const [isAssistantDropdownOpen, setIsAssistantDropdownOpen] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // TODO: API에서 프로젝트 정보 가져오기
  const projectName = "종합설계프로젝트 1팀";

  const handleDropdownToggle = () => {
    setIsAssistantDropdownOpen(!isAssistantDropdownOpen);
  };

  const handleAssistantSelect = (assistant: AssistantType) => {
    setSelectedAssistant(assistant);
    setIsAssistantDropdownOpen(false);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "복사되었습니다!",
      duration: 3000,
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
            <InitialView
              selectedAssistant={selectedAssistant}
              isDropdownOpen={isAssistantDropdownOpen}
              onDropdownToggle={handleDropdownToggle}
              onAssistantSelect={handleAssistantSelect}
            />
          ) : (
            <CommandView onCopyCommand={handleCopyCommand} />
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
