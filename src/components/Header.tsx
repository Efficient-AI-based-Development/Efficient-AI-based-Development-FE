import { useState, useRef, useEffect } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { authService } from "@/pages/auth/services/authService";

// 네비게이션 메뉴 데이터
const NAV_ITEMS = [
  { path: "/task", label: "태스크 관리" },
  { path: "/insight", label: "인사이트" },
  { path: "/project-setting", label: "프로젝트 설정" },
] as const;

// 드롭다운 메뉴 데이터
const DROPDOWN_ITEMS = [
  { path: "/my-projects", label: "내 프로젝트 관리" },
  { path: "/guide", label: "MCP 연동 가이드" },
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
  // 초기 로그인 상태를 localStorage에서 직접 확인
  const getInitialLoginStatus = () => {
    if (typeof window === "undefined") return false;
    // token, accessToken, 또는 isLoggedIn 중 하나라도 있으면 로그인 상태로 판단
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    return !!token || isLoggedIn === "true";
  };

  // 초기 프로젝트 ID를 localStorage에서 확인
  const getInitialProjectId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("currentProjectId");
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginStatus);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    getInitialProjectId(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const location = useRouterState({
    select: (state) => state.location,
  });

  // 로그인 상태 확인 (한 번만 체크)
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const isLoggedInValue = localStorage.getItem("isLoggedIn");
    const loggedIn = !!token || isLoggedInValue === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // 선택된 프로젝트 ID 동기화
  const syncProjectId = () => {
    if (typeof window === "undefined") {
      return;
    }

    const searchProjectId =
      (location.search as { projectId?: string } | undefined)?.projectId ??
      null;

    if (searchProjectId) {
      localStorage.setItem("currentProjectId", searchProjectId);
      setSelectedProjectId(searchProjectId);
      return;
    }

    // URL에 projectId가 없으면 localStorage에서 확인
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setSelectedProjectId(storedProjectId);
    } else {
      setSelectedProjectId(null);
    }
  };

  useEffect(() => {
    syncProjectId();

    // localStorage 변경 감지 (다른 탭에서의 변경)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentProjectId") {
        syncProjectId();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 주기적으로 체크 (같은 탭에서의 localStorage 변경 감지)
    const interval = setInterval(syncProjectId, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [location]);

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

  const hasSelectedProject = Boolean(selectedProjectId);

  // 프로젝트 관련 페이지 경로
  const projectPages = ["/task", "/insight", "/project-setting"];
  const currentPath = location.pathname;
  const isProjectPage = projectPages.includes(currentPath);

  // 네비게이션 표시 조건: 프로젝트가 선택되어 있고, 현재 프로젝트 관련 페이지에 있을 때
  const shouldShowNavigation = hasSelectedProject && isProjectPage;

  const navigateWithProjectGuard = (path: string) => {
    setIsDropdownOpen(false);

    // 프로젝트 선택이 필요 없는 페이지들
    const publicPages = ["/my-projects", "/guide"];

    // 프로젝트 선택이 필요 없는 페이지는 바로 이동
    if (publicPages.includes(path)) {
      router.navigate({ to: path });
      return;
    }

    // 프로젝트 관련 페이지는 프로젝트 선택이 필요
    if (!hasSelectedProject) {
      router.navigate({ to: "/my-projects" });
      return;
    }

    // 프로젝트 관련 페이지들에 projectId 전달
    if (projectPages.includes(path) && selectedProjectId) {
      router.navigate({
        to: path,
        search: (prev) => ({
          ...(prev ?? {}),
          projectId: selectedProjectId,
        }),
      });
      return;
    }

    router.navigate({ to: path });
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await authService.logout();
      setIsLoggedIn(false);
      localStorage.removeItem("currentProjectId");
      router.navigate({ to: "/" });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.googleLogin();
      // 리다이렉트되므로 여기까지 도달하지 않음
    } catch (error) {
      console.error("구글 로그인 실패:", error);
      setIsLoading(false);
    }
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

        {/* 로그인 상태에 따른 조건부 렌더링 */}
        {isLoggedIn ? (
          /* 네비게이션 + 햄버거 메뉴 그룹 (로그인된 경우) */
          <div className="flex items-center gap-6 tablet:gap-12">
            {/* 중앙 네비게이션 - 프로젝트 관련 페이지에 있을 때만 표시 */}
            {shouldShowNavigation && (
              <nav className="hidden tablet:flex items-center gap-6 xl:gap-8">
                {NAV_ITEMS.map((item) => {
                  const shouldIncludeProjectId =
                    projectPages.includes(item.path) && selectedProjectId;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      search={
                        shouldIncludeProjectId
                          ? { projectId: selectedProjectId }
                          : undefined
                      }
                      className={STYLES.navLink}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* 햄버거 메뉴 (항상 표시) */}
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
                      onClick={() => navigateWithProjectGuard(item.path)}
                      className={STYLES.dropdownItem}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className={STYLES.logoutButton}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 구글로 로그인 버튼 (로그인되지 않은 경우) */
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="hidden sm:inline">로그인 중...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="hidden sm:inline">Google로 로그인</span>
                <span className="sm:hidden">로그인</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 모바일 오버레이 (≤ 812px) - 로그인된 경우만 */}
      {isLoggedIn && isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 tablet:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* 모바일 슬라이드 사이드바 (≤ 812px) - 로그인된 경우만 */}
      {isLoggedIn && (
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

          {/* 설정 메뉴 */}
          <div className="p-4">
            <div className="mb-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              설정
            </div>
            {DROPDOWN_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigateWithProjectGuard(item.path)}
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
      )}
    </header>
  );
}
