import { Outlet, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";

export function RootLayout() {
  return (
    <div className="p-6">
      <header className="flex items-center gap-4 mb-6">
        <h1 className="font-bold">Efficient FE</h1>
        <nav className="flex gap-4">
          <Link to="/" className="[&.active]:font-semibold">
            홈
          </Link>
          <Link to="/document" className="[&.active]:font-semibold">
            문서
          </Link>
          <Link to="/task" className="[&.active]:font-semibold">
            태스크
          </Link>
          <Link to="/insight" className="[&.active]:font-semibold">
            완료
          </Link>
        </nav>
      </header>
      <Outlet />
      <Toaster />
    </div>
  );
}

export function NotFound() {
  return <div className="p-6 text-gray-500">페이지를 찾을 수 없습니다.</div>;
}
