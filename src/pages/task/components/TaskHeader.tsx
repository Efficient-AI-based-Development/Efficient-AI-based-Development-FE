import { ScanSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { TaskStats } from "../../../types/task";

interface TaskHeaderProps {
  stats: TaskStats;
}

export default function TaskHeader({ stats }: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-1">
      {/* 검색바 */}
      <div className="relative w-80">
        <ScanSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-6 z-10" />
        <Input
          type="text"
          placeholder="Task를 검색해보세요!"
          className="pl-10 h-12"
        />
      </div>

      {/* 통계 */}
      <div className="flex items-baseline gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-lg">전체 Task</span>
          <span className="text-primary text-3xl font-bold">
            {stats.totalTasks}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-lg">진행률</span>
          <span className="text-primary text-3xl font-bold">
            {stats.completionRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
