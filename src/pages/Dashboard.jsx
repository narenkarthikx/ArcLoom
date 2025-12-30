export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-semibold text-slate-700 mb-2">Today's Schedule</h2>
                    <p className="text-slate-500 text-sm">No events today</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-semibold text-slate-700 mb-2">Priority Tasks</h2>
                    <p className="text-slate-500 text-sm">No pending tasks</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-semibold text-slate-700 mb-2">Habit Streak</h2>
                    <p className="text-slate-500 text-sm">Start a habit to see progress</p>
                </div>
            </div>
        </div>
    );
}
