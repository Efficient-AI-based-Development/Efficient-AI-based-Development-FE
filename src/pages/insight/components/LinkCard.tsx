import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

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
      className="flex h-full min-h-[200px] w-full flex-col rounded-lg border border-gray-300 bg-white pt-6 pb-8 px-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="text-xl ml-2 font-normal text-black">{subtitle}</div>
      </div>
      <div
        className="mt-auto ml-2 grid items-center gap-4"
        style={{ gridTemplateColumns: "1fr auto" }}
      >
        <div className="text-4xl font-extrabold tracking-tight text-black">
          {title}
        </div>
        <div className="flex justify-end flex-shrink-0">
          {right ?? <ChevronRight className="h-8 w-8 text-black" />}
        </div>
      </div>
    </button>
  );
}
