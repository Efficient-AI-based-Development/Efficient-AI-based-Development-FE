import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}

export default function KpiCard({ title, value, sub, icon }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {icon}
      </div>
      <div className="mt-3 text-4xl font-extrabold tracking-tight">{value}</div>
      {sub ? <div className="mt-2 text-sm text-gray-500">{sub}</div> : null}
    </div>
  );
}
