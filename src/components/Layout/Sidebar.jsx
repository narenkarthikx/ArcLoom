import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckCircle2, Flame, BookOpen, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { signOut } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Tasks', path: '/tasks', icon: CheckCircle2 },
        { name: 'Habits', path: '/habits', icon: Flame },
        { name: 'Notes', path: '/notes', icon: BookOpen },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className={`
            fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 flex flex-col z-50
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}>
            <div className="p-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                        ArcLoom
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">WEAVE YOUR DESTINY</p>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-1 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-4">
                {links.map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => onClose && onClose()} // Close on mobile nav
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                                ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                        >
                            {active && (
                                <div className="absolute inset-0 bg-indigo-400/5 blur-xl"></div>
                            )}
                            <link.icon size={20} className={`relative z-10 transition-colors ${active ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:text-indigo-300'}`} />
                            <span className="relative z-10 font-medium">{link.name}</span>
                            {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_currentColor]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2 bg-slate-900/20">
                <button
                    onClick={signOut}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
