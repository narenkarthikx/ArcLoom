export default function TasksPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Tasks</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Add
                    </button>
                </div>
                <div className="space-y-2">
                    <p className="text-slate-500 text-center py-8">No tasks found</p>
                </div>
            </div>
        </div>
    );
}
