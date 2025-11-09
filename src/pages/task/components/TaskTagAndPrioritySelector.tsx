import { Slider } from "@/components/ui/slider";
import TaskTag from "./TaskTag";
import type { TaskType } from "../../../types/task";

interface TaskTagAndPrioritySelectorProps {
  selectedType: TaskType;
  priority: number;
  onTypeChange: (type: TaskType) => void;
  onPriorityChange: (priority: number) => void;
  disabled?: boolean;
}

export default function TaskTagAndPrioritySelector({
  selectedType,
  priority,
  onTypeChange,
  onPriorityChange,
  disabled = false,
}: TaskTagAndPrioritySelectorProps) {
  const handlePriorityChange = (value: number[]) => {
    if (!disabled) {
      onPriorityChange(value[0]);
    }
  };

  const containerClassName = `border rounded-xl p-4 shadow-sm transition-all ${
    disabled
      ? "border-gray-200 bg-gray-50/50"
      : "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
  }`;

  return (
    <div className={containerClassName}>
      <div className="grid grid-cols-2 gap-8">
        {/* 태그 선택 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">태그</span>
            {disabled && (
              <span className="text-xs text-gray-400 italic">(수정 불가)</span>
            )}
          </div>
          <div className="flex gap-3">
            <TaskTag
              type="DEV"
              isButton
              isSelected={selectedType === "DEV"}
              onClick={disabled ? undefined : () => onTypeChange("DEV")}
            />
            <TaskTag
              type="DESIGN"
              isButton
              isSelected={selectedType === "DESIGN"}
              onClick={disabled ? undefined : () => onTypeChange("DESIGN")}
            />
            <TaskTag
              type="DOCS"
              isButton
              isSelected={selectedType === "DOCS"}
              onClick={disabled ? undefined : () => onTypeChange("DOCS")}
            />
          </div>
        </div>

        {/* 중요도 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                중요도
              </span>
              {disabled && (
                <span className="text-xs text-gray-400 italic">
                  (수정 불가)
                </span>
              )}
            </div>
            <span className="font-bold text-lg text-red-500">{priority}</span>
          </div>
          <div className="space-y-2">
            <div className={disabled ? "opacity-50 cursor-not-allowed" : ""}>
              <Slider
                value={[priority]}
                onValueChange={handlePriorityChange}
                min={0}
                max={10}
                step={1}
                disabled={disabled}
                className={disabled ? "pointer-events-none" : ""}
              />
            </div>
            <div className="relative w-full">
              <div className="flex justify-between pl-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span
                    key={num}
                    className={`text-xs ${
                      disabled ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
