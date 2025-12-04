import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { mockData } from "./mocks/mockData";
import { markdownComponents } from "@/pages/task/components/TaskDetailModal/markdownComponents";

export default function CheckPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/document/check" });
  const [activeTab, setActiveTab] = useState<"PRD" | "UserStory" | "SRS">("PRD");

  const handleRevise = () => {
    const { projectId } = search || {};
    navigate({
      to: "/document/setting3",
      search: {
        projectId: projectId || undefined,
      },
    });
  };

  const handleComplete = () => {
    navigate({
      to: "/task",
    });
  };

  return (
    <div className="bg-white min-h-screen p-8 px-16">
      <div className="mx-auto mt-4">
        {/* 진행 바 섹션 */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-start items-center gap-4">
            <button 
              onClick={handleRevise}
              className="text-gray-400 hover:text-gray-600 text-3xl"
            >
              &lt;
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold text-gray-600">
                PRD / UserStory / SRS 최종 확인
              </div>
              <div className="h-2 bg-[#D9D9D9] rounded-full overflow-hidden relative w-[500px]">
                <div
                  className="h-full bg-[#7871FE] rounded-full transition-all"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* 탭 버튼 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setActiveTab("PRD")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "PRD"
                  ? "bg-[#7871FE]/20 text-[#7871FE] border border-[#7871FE]"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              PRD
            </button>
            <button
              onClick={() => setActiveTab("UserStory")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "UserStory"
                  ? "bg-[#7871FE]/20 text-[#7871FE] border border-[#7871FE]"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              UserStory
            </button>
            <button
              onClick={() => setActiveTab("SRS")}
              className={`px-6 py-3 rounded-3xl font-semibold text-base transition-colors ${
                activeTab === "SRS"
                  ? "bg-[#7871FE]/20 text-[#7871FE] border border-[#7871FE]"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              SRS
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-col h-[calc(100vh-370px)]">
          {/* 문서 표시 영역 */}
          <div className="flex-1 bg-white border-2 border-[#7871FE] rounded-2xl p-8 overflow-y-auto">
            <div className="text-gray-700">
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {mockData[activeTab]}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleRevise}
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 text-md font-semibold hover:bg-gray-300 transition-colors"
          >
            다시 수정할래요
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-3 rounded-xl bg-[#7871FE]/20 text-[#7871FE] text-md font-semibold hover:bg-[#7871FE]/30 transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
