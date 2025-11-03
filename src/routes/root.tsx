import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

export function NotFound() {
  return <div className="p-6 text-gray-500">페이지를 찾을 수 없습니다.</div>;
}
