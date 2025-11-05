import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}

export default function KpiCard({ title, value, sub, icon }: KpiCardProps) {
  return (
    <div
      className="grid h-full min-h-[200px] gap-4 rounded-lg border border-gray-300 bg-white p-6"
      style={{ gridTemplateColumns: "1fr auto" }}
    >
      <div className="flex flex-col flex-1">
        <div className="text-xl font-semibold text-black">{title}</div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="text-5xl font-extrabold tracking-tight text-black">
            {value}
          </div>
          {sub ? (
            <div className="mt-2 text-sm font-normal text-primary">{sub}</div>
          ) : (
            <div className="mt-2"></div>
          )}
        </div>
      </div>
      {icon && (
        <div className="flex items-center justify-end flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
}
