import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>

    </div>
  );
}

export function NotFound() {
  return <div className="p-6 text-gray-500">페이지를 찾을 수 없습니다.</div>;
}
