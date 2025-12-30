import { LayoutDashboard, Calendar, CheckSquare, Activity, FileText } from 'lucide-react';

export const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Activity },
    { name: 'Notes', path: '/notes', icon: FileText },
];
