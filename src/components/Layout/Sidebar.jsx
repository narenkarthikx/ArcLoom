import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navItems } from '../../config/nav';

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col hidden md:flex">
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    ArcLoom
                </h1>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="text-sm">
                        <p className="font-medium text-slate-700">User</p>
                        <p className="text-xs text-slate-500">Free Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
