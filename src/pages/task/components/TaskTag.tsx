import type { TaskType } from "../../../types/task";

interface TaskTagProps {
  type: TaskType;
  number?: number; // deprecated: 더 이상 사용하지 않음 (호환성을 위해 유지)
  isButton?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function TaskTag({
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  number: _,
  isButton = false,
  isSelected = false,
  onClick,
}: TaskTagProps) {
  const getTypeColor = () => {
    switch (type) {
      case "DEV":
        return isButton && !isSelected
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-primary text-white";
      case "DESIGN":
        return isButton && !isSelected
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-yellow-400 text-white";
      case "DOCS":
        return isButton && !isSelected
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const isDisabled = isButton && !onClick;
  const baseClasses = `${getTypeColor()} text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
    isDisabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  if (isButton) {
    return (
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={baseClasses}
        type="button"
      >
        {type}
      </button>
    );
  }

  return <span className={baseClasses}>{type}</span>;
}
