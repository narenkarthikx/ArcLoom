import { motion } from 'framer-motion';
import { eachDayOfInterval, endOfYear, format, startOfYear } from 'date-fns';

export default function YearlyHeatmap({ logs = [] }) {
    const today = new Date();
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);

    // Generate all days for the year
    const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

    // Helper to find log for a specific day
    const getIntensity = (day) => {
        // Find log matches formatted date string from DB (yyyy-mm-dd)
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs.find(l => l.date === dateStr);

        if (!log) return 0;

        // Intensity Logic: 
        // 1: Minimal activity (any task/habit)
        // 2: Good activity (>2 items)
        // 3: High activity (>5 items)
        const totalActivity = (log.habits_done || 0) + (log.tasks_done || 0);

        if (totalActivity === 0) return 0;
        if (totalActivity < 3) return 1;
        if (totalActivity < 6) return 2;
        return 3;
    };

    const getColor = (level) => {
        switch (level) {
            case 0: return 'bg-white/5 data-[future=true]:opacity-20'; // Base empty state
            case 1: return 'bg-indigo-900/60 border border-indigo-500/30';
            case 2: return 'bg-indigo-600 border border-indigo-400/50 shadow-[0_0_8px_-2px_rgba(99,102,241,0.6)]';
            case 3: return 'bg-indigo-400 border border-indigo-200/50 shadow-[0_0_12px_-2px_rgba(99,102,241,1)]';
            default: return 'bg-white/5';
        }
    };

    // Calculate Month Labels positions
    const months = [];
    let currentMonth = -1;
    days.forEach((day, index) => {
        const month = day.getMonth();
        if (month !== currentMonth) {
            // Found a new month, approx calculate grid column position (index / 7)
            months.push({ name: format(day, 'MMM'), index: Math.floor(index / 7) });
            currentMonth = month;
        }
    });

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[800px] select-none">

                {/* Months Header */}
                <div className="flex relative h-6 mb-2 text-xs font-bold text-slate-500 tracking-wider">
                    {months.map((m) => (
                        // Absolute positioning based on week index roughly maps to grid columns
                        <div key={m.name} style={{ left: `${m.index * 14}px` }} className="absolute">
                            {m.name}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    {/* Weekday Labels (Mon/Wed/Fri) */}
                    <div className="flex flex-col gap-[3px] pt-[15px] mr-2">
                        {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-600 h-[10px] w-6 text-right block leading-[10px]">{d}</span>
                        ))}
                    </div>

                    {/* Main Grid: Columns (Weeks) x Rows (Days) */}
                    <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
                        {days.map((day) => {
                            const intensity = getIntensity(day);
                            const isFuture = day > today;

                            return (
                                <motion.div
                                    key={day.toISOString()}
                                    initial={false} // Disable initial animation for massive grid to save perf
                                    className={`
                                        w-[10px] h-[10px] rounded-[2px] transition-colors duration-300
                                        ${getColor(intensity)}
                                    `}
                                    // Data attribute for future styling if needed
                                    data-future={isFuture}
                                    title={`${format(day, 'MMM do')}: ${intensity > 0 ? 'Active' : 'No Activity'}`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
