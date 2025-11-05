import { ReactNode } from "react";

interface LinkCardProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
}

export default function LinkCard({
  title,
  subtitle,
  right,
  onClick,
}: LinkCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
    >
      <div>
        {subtitle ? (
          <div className="text-xs font-semibold tracking-wide text-gray-500">
            {subtitle}
          </div>
        ) : null}
        <div className="mt-1 text-2xl font-extrabold tracking-tight">
          {title}
        </div>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600">
        {right ?? "›"}
      </div>
    </button>
  );
}
