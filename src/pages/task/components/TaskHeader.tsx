import { Search } from "lucide-react";
import type { TaskStats } from "../../../types/task";

interface TaskHeaderProps {
  stats: TaskStats;
}

export default function TaskHeader({ stats }: TaskHeaderProps) {
  return (
    <div className="mb-6">
      {/* 상단 제목 및 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-customBlack">
          종합설계프로젝트 1팀 의 대시보드
        </h1>
        <button className="px-6 py-2 bg-customBlack text-white rounded-lg hover:bg-opacity-90 transition-colors">
          인사이트 보기
        </button>
      </div>

      {/* 검색바 및 통계 */}
      <div className="flex items-center justify-between">
        {/* 검색바 */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Task를 검색해보세요!"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-lg">전체 Task</span>
            <span className="text-primary text-3xl font-bold">
              {stats.totalTasks}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-lg">진행률</span>
            <span className="text-primary text-3xl font-bold">
              {stats.completionRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
