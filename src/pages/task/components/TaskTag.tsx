import type { TaskType } from "../../../types/task";

interface TaskTagProps {
  type: TaskType;
  number?: number;
  isButton?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function TaskTag({
  type,
  number = 1,
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

  const baseClasses = `${getTypeColor()} text-xs px-3 py-1 rounded-full font-semibold transition-colors`;

  if (isButton) {
    return (
      <button onClick={onClick} className={baseClasses} type="button">
        {type}#{number}
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      {type}#{number}
    </span>
  );
}
