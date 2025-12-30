export default function HabitsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Habit Tracker</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                <h2 className="font-semibold text-slate-700 mb-4">Your Progress</h2>
                <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    Heatmap Visualization
                </div>
            </div>
        </div>
    );
}
