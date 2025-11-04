import AssistantDropdown from "./AssistantDropdown";
import type { AssistantType } from "../types";

interface InitialViewProps {
  selectedAssistant: AssistantType | null;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onAssistantSelect: (assistant: AssistantType) => void;
}

export default function InitialView({
  selectedAssistant,
  isDropdownOpen,
  onDropdownToggle,
  onAssistantSelect,
}: InitialViewProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        프로젝트를 연동하세요
      </h2>
      <p className="text-gray-600 mb-6 text-base">
        사용할 AI assistant를 선택하세요.
      </p>

      <AssistantDropdown
        selectedAssistant={selectedAssistant}
        isOpen={isDropdownOpen}
        onToggle={onDropdownToggle}
        onSelect={onAssistantSelect}
      />

      <div className="mt-2 h-6">
        {selectedAssistant && (
          <p className="text-gray-600 text-sm">
            완료 버튼을 눌러 CLI 명령어를 확인하세요.
          </p>
        )}
      </div>
    </div>
  );
}
