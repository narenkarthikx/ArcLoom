export default function NotesPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Notes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="aspect-[4/5] bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-100 flex flex-col cursor-pointer hover:-translate-y-1 transition-transform">
                    <h3 className="font-semibold text-yellow-900 mb-2">Project Ideas</h3>
                    <p className="text-yellow-800/60 text-sm flex-1">
                        - Unified Productivity App
                        - Smart Reminders
                    </p>
                </div>
                <div className="aspect-[4/5] bg-white border-2 border-dashed border-slate-200 p-6 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                    + New Note
                </div>
            </div>
        </div>
    );
}
