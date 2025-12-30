import CalendarWidget from '../components/Dashboard/CalendarWidget';
import TaskWidget from '../components/Dashboard/TaskWidget';
import HabitWidget from '../components/Dashboard/HabitWidget';

export default function Dashboard() {
    const currentDate = new Date();
    const hour = currentDate.getHours();

    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{greeting}, User</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening today.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                    + Quick Add
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[500px]">
                <CalendarWidget />
                <TaskWidget />
                <HabitWidget />
            </div>
        </div>
    );
}
