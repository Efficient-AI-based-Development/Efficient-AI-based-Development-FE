import { Outlet, Link } from "@tanstack/react-router";

export function RootLayout() {
    return (
        <div className="p-6">
            <header className="flex items-center gap-4 mb-6">
                <h1 className="font-bold">Efficient FE</h1>
                <Link to="/" className="[&.active]:font-semibold">홈</Link>
            </header>
            <Outlet />
        </div>
    );
}

export function NotFound() {
    return <div className="p-6 text-gray-500">페이지를 찾을 수 없습니다.</div>;
}
