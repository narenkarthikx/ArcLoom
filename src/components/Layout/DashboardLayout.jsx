import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="md:ml-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
