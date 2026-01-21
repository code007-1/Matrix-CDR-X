import { Outlet } from "react-router-dom";
import UpperMenu from "./menu/uppermenu";

export function Layout() {

    return (
        <>
            <div className="min-h-screen bg-background font-sans antialiased">
                <UpperMenu />
                <main className="w-full px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </main>
            </div>
        </>
    );
}