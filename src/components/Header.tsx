import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

// 네비게이션 메뉴 데이터
const NAV_ITEMS = [
  { path: "/task", label: "태스크 관리" },
  { path: "/insight", label: "인사이트" },
  { path: "/project-setting", label: "프로젝트 설정" },
] as const;

// 드롭다운 메뉴 데이터
const DROPDOWN_ITEMS = [
  { path: "/my-projects", label: "내 프로젝트 관리" },
  { path: "/mcp", label: "MCP 연동" },
  { path: "/guide", label: "MCP 연동 가이드" },
  { path: "/account", label: "계정 설정" },
] as const;

// 공통 스타일
const STYLES = {
  navLink:
    "text-gray-700 hover:text-gray-900 font-medium transition-colors [&.active]:text-primary [&.active]:font-bold",
  dropdownItem:
    "w-full text-left px-3 py-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700",
  logoutButton:
    "w-full text-left px-3 py-2 hover:bg-red-200 rounded-md transition-colors text-red-600 font-medium",
} as const;

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDropdownItemClick = (path: string) => {
    setIsDropdownOpen(false);
    router.navigate({ to: path });
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    console.log("로그아웃");
    // TODO: 실제 로그아웃 로직 구현
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        {/* 로고 영역 */}
        <Link
          to="/"
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.svg"
            alt="ATrina Logo"
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg md:text-xl text-gray-900">
              ATrina
            </span>
            <span className="hidden sm:inline text-sm md:text-base text-gray-900">
              : AI-Efficient-development
            </span>
          </div>
        </Link>

        {/* 네비게이션 + 햄버거 메뉴 그룹 */}
        <div className="flex items-center gap-6 tablet:gap-12">
          {/* 중앙 네비게이션 - 812px 이상에서만 표시 */}
          <nav className="hidden tablet:flex items-center gap-6 xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} className={STYLES.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 햄버거 메뉴 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="메뉴"
            >
              <Menu className="w-5 h-5 tablet:w-6 tablet:h-6 text-gray-700" />
            </button>

            {/* 데스크탑 드롭다운 메뉴 (> 812px) */}
            {isDropdownOpen && (
              <div className="hidden tablet:block absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 px-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                {DROPDOWN_ITEMS.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleDropdownItemClick(item.path)}
                    className={STYLES.dropdownItem}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-gray-200 my-2"></div>
                <button onClick={handleLogout} className={STYLES.logoutButton}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 오버레이 (≤ 812px) */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 tablet:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* 모바일 슬라이드 사이드바 (≤ 812px) */}
      <div
        className={`
          fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isDropdownOpen ? "translate-x-0" : "translate-x-full"}
          tablet:hidden
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <span className="font-bold text-lg text-gray-900">메뉴</span>
          <button
            onClick={() => setIsDropdownOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* 메인 네비게이션 */}
        <nav className="p-4">
          <div className="mb-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            프로젝트 메뉴
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleDropdownItemClick(item.path)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 구분선 */}
        <div className="border-t border-gray-200 mx-4"></div>

        {/* 설정 메뉴 */}
        <div className="p-4">
          <div className="mb-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            설정
          </div>
          {DROPDOWN_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleDropdownItemClick(item.path)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 로그아웃 (하단 고정) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
