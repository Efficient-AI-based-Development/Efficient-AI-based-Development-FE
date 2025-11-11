import { useState, useEffect, useRef } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";

const TECH_STACK_OPTIONS = [
  "React",
  "Vue.js",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
];

const AI_MODEL_OPTIONS = [
  "Cursor",
  "ChatGPT-4",
  "Gemini",
];

const NUMBER_OPTIONS = Array.from({ length: 30 }, (_, i) => (i + 1).toString());

export default function SettingPage1() {
  const search = useSearch({ from: "/document/confirm" });
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [mainColor, setMainColor] = useState("#7871FE");
  const [pageCount, setPageCount] = useState("");
  const [featureCount, setFeatureCount] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);
  const [isAiModelOpen, setIsAiModelOpen] = useState(false);
  const [isPageCountOpen, setIsPageCountOpen] = useState(false);
  const [isFeatureCountOpen, setIsFeatureCountOpen] = useState(false);
  const techStackRef = useRef<HTMLDivElement>(null);
  const aiModelRef = useRef<HTMLDivElement>(null);
  const pageCountRef = useRef<HTMLDivElement>(null);
  const featureCountRef = useRef<HTMLDivElement>(null);

  const initialMessage = search?.initialMessage;

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        techStackRef.current &&
        !techStackRef.current.contains(event.target as Node)
      ) {
        setIsTechStackOpen(false);
      }
      if (
        aiModelRef.current &&
        !aiModelRef.current.contains(event.target as Node)
      ) {
        setIsAiModelOpen(false);
      }
      if (
        pageCountRef.current &&
        !pageCountRef.current.contains(event.target as Node)
      ) {
        setIsPageCountOpen(false);
      }
      if (
        featureCountRef.current &&
        !featureCountRef.current.contains(event.target as Node)
      ) {
        setIsFeatureCountOpen(false);
      }
    }

    if (isTechStackOpen || isAiModelOpen || isPageCountOpen || isFeatureCountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTechStackOpen, isAiModelOpen, isPageCountOpen, isFeatureCountOpen]);

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    projectName.trim() !== "" &&
    pageCount.trim() !== "" &&
    featureCount.trim() !== "" &&
    aiModel.trim() !== "" &&
    techStack.length > 0;

  const handleComplete = () => {
    if (!isFormValid) return;
    // 세팅 페이지2로 이동 (설정 정보 전달)
    navigate({
      to: "/document/setting2",
      search: {
        projectName,
        mainColor,
        pageCount,
        featureCount,
        aiModel,
        techStack: techStack.join(","),
      },
    });
  };

  return (
    <div className="bg-white p-8 px-16">
      <div className="mx-auto mt-4">
        {/* 인사말 박스 */}
        {initialMessage && (
          <div className="flex flex-col gap-4 mb-8">
            {/* 진행 바 */}
            <div className="flex justify-start items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 text-3xl">
                &lt;
              </button>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-medium text-gray-700">
                  기초 세팅
                </div>
                <div className="h-2 bg-[#D9D9D9] rounded-full overflow-hidden relative w-[500px]">
                  <div
                    className="h-full bg-[#7871FE] rounded-full transition-all"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-3xl">
                &gt;
              </button>
            </div>
            <div className="flex justify-start">
              <div className="bg-[#7871FE]/30 rounded-2xl p-8 border border-[#7871FE]/30 mt-16 ml-8">
              <p className="font-semibold text-lg leading-relaxed">
                {initialMessage}을(를) 하실거군요!
              </p>
              <p className="font-semibold text-lg leading-relaxed">
                만들고 싶은 프로젝트를 제가 이해할 수 있도록 상세히 설명해 주세요.
              </p>
              </div>
            </div>
          </div>
        )}

        {/* 폼 섹션 */}
        <div className="flex justify-end mb-8 mt-14 mr-8">
          <div className="border-2 border-[#7871FE] rounded-2xl p-10 w-2/3">
            <div className="grid grid-cols-2 gap-8">
            {/* 왼쪽 열 */}
            <div className="space-y-6">
              {/* 1. 프로젝트 이름 */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  1. 프로젝트 이름 :
                </label>
                <Input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트 이름을 입력하세요..."
                  className="w-full border-gray-300 rounded-2xl h-14 text-base"
                />
              </div>

              {/* 2. 메인 컬러 */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  2. 메인 컬러 :
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={mainColor}
                    onChange={(e) => setMainColor(e.target.value)}
                    className="w-full border-gray-300 rounded-2xl h-14 text-base pl-12"
                  />
                  <input
                    type="color"
                    value={mainColor}
                    onChange={(e) => setMainColor(e.target.value)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer opacity-0"
                    style={{ backgroundColor: mainColor }}
                  />
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer pointer-events-auto z-10"
                    style={{ backgroundColor: mainColor }}
                    onClick={(e) => {
                      const colorInput = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      colorInput?.click();
                    }}
                  />
                </div>
              </div>

              {/* 3. 페이지 수 */}
              <div className="relative" ref={pageCountRef}>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  3. 페이지 수 :
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    onFocus={() => setIsPageCountOpen(true)}
                    placeholder="제작할 페이지 수를 입력하세요..."
                    className="w-full pr-10 border-gray-300 rounded-2xl h-14 text-base"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {isPageCountOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {NUMBER_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setPageCount(option);
                            setIsPageCountOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-sm ${
                            pageCount === option ? "bg-gray-100" : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 열 */}
            <div className="space-y-6">
              {/* 4. 구현할 기능 수 */}
              <div className="relative" ref={featureCountRef}>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  4. 구현할 기능 수 :
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={featureCount}
                    onChange={(e) => setFeatureCount(e.target.value)}
                    onFocus={() => setIsFeatureCountOpen(true)}
                    placeholder="구현할 기능 수를 입력하세요..."
                    className="w-full pr-10 border-gray-300 rounded-2xl h-14 text-base"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {isFeatureCountOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {NUMBER_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setFeatureCount(option);
                            setIsFeatureCountOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-sm ${
                            featureCount === option ? "bg-gray-100" : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. AI 모델 */}
              <div className="relative" ref={aiModelRef}>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  5. AI 모델 :
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    onFocus={() => setIsAiModelOpen(true)}
                    placeholder="AI 모델을 선택하세요..."
                    className="w-full pr-10 border-gray-300 rounded-2xl h-14 text-base"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {isAiModelOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                      {AI_MODEL_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setAiModel(option);
                            setIsAiModelOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-sm ${
                            aiModel === option ? "bg-gray-100" : ""
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 6. 기술 스택 */}
              <div className="relative" ref={techStackRef}>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  6. 기술 스택 :
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsTechStackOpen(!isTechStackOpen)}
                    className="w-full min-h-14 border border-gray-300 rounded-2xl p-3 flex items-center gap-2 flex-wrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7871FE]"
                  >
                    {techStack.length === 0 ? (
                      <span className="text-gray-400 text-sm">사용할 프레임워크를 선택하세요...</span>
                    ) : (
                      <>
                        {techStack.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#7871FE]/10 text-[#7871FE] rounded-lg text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTechStack(techStack.filter((t) => t !== item));
                            }}
                          >
                            {item}
                            <svg
                              className="w-4 h-4 cursor-pointer hover:text-[#7871FE]/70"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </span>
                        ))}
                      </>
                    )}
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  {isTechStackOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {TECH_STACK_OPTIONS.map((option) => {
                        const isSelected = techStack.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              if (isSelected) {
                                setTechStack(techStack.filter((t) => t !== option));
                              } else {
                                setTechStack([...techStack, option]);
                              }
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-900 text-sm flex items-center gap-2 ${
                              isSelected ? "bg-gray-100" : ""
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-[#7871FE] border-[#7871FE]"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleComplete}
              disabled={!isFormValid}
              className={`px-8 py-4 rounded-2xl transition-colors font-semibold text-lg ${
                isFormValid
                  ? "!bg-[#7871FE] !text-white hover:bg-[#6a63d4] cursor-pointer"
                  : "!bg-[#D9D9D9] !text-black"
              }`}
            >
              완료
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
