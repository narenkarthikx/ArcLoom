import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import InteractiveBackground from '../InteractiveBackground';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <InteractiveBackground>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {/* Compact Logo for Mobile Header */}
                    <span className="text-xl font-bold text-white tracking-tight">ArcLoom</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg active:scale-95 transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="md:ml-64 w-full min-h-screen relative z-10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </InteractiveBackground>
    );
}
