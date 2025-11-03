import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu } from "lucide-react";

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
  { path: "/guide", label: "사용 가이드" },
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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-3">
        {/* 로고 영역 */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.svg" alt="ATLAS Logo" className="w-12 h-12" />
          <div className="flex items-center gap-1">
            <span className="font-bold text-xl text-gray-900">ATLAS</span>
            <span className="text-gray-900 text-base">
              : AI-Efficient-development
            </span>
          </div>
        </Link>

        {/* 네비게이션 + 햄버거 메뉴 그룹 */}
        <div className="flex items-center gap-12">
          {/* 중앙 네비게이션 */}
          <nav className="flex items-center gap-8">
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
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
    </header>
  );
}
