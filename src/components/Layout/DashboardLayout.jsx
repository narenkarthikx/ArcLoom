import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import InteractiveBackground from '../InteractiveBackground';

export default function DashboardLayout() {
    return (
        <InteractiveBackground>
            <Sidebar />
            <main className="md:ml-64 w-full min-h-screen relative z-10">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </InteractiveBackground>
    );
}
