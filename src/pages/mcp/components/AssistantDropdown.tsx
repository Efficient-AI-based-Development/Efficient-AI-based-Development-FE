import { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ASSISTANTS, type AssistantType } from "../types";

interface AssistantDropdownProps {
  selectedAssistant: AssistantType | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (assistant: AssistantType) => void;
}

export default function AssistantDropdown({
  selectedAssistant,
  isOpen,
  onToggle,
  onSelect,
}: AssistantDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onToggle();
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative w-80 mx-auto" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left bg-black text-white border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between"
      >
        <span className="text-base">
          {selectedAssistant || "사용할 AI assistant 선택하기"}
        </span>
        <ChevronDown className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {ASSISTANTS.map((assistant) => (
            <button
              key={assistant}
              onClick={() => onSelect(assistant)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-base"
            >
              {assistant}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
