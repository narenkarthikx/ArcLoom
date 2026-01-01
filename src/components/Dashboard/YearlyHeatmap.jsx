import { motion } from 'framer-motion';
import { eachDayOfInterval, endOfMonth, endOfYear, format, getDay, isSameDay, startOfMonth, startOfYear, eachMonthOfInterval } from 'date-fns';

export default function YearlyHeatmap({ logs = [] }) {
    const today = new Date();
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);

    // Get all months for the year
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const getIntensity = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs.find(l => l.date === dateStr);
        if (!log) return 0;
        const totalActivity = (log.habits_done || 0) + (log.tasks_done || 0);
        if (totalActivity === 0) return 0;
        if (totalActivity <= 2) return 1;
        if (totalActivity <= 5) return 2;
        return 3;
    };

    const getStyle = (level, isFuture) => {
        if (isFuture) return 'bg-slate-900/40 border border-white/5 opacity-30';

        switch (level) {
            case 0: return 'bg-slate-800/40 border border-white/5 hover:border-white/20';
            case 1: return 'bg-indigo-900/80 border border-indigo-500/30 shadow-[0_0_8px_-4px_rgba(99,102,241,0.5)]';
            case 2: return 'bg-violet-600 border border-violet-400/50 shadow-[0_0_12px_-2px_rgba(139,92,246,0.6)]';
            case 3: return 'bg-cyan-400 border border-cyan-200/50 shadow-[0_0_15px_rgba(34,211,238,0.8)]';
            default: return 'bg-slate-800/40';
        }
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-2 min-w-max pl-2">

                    {/* Row Labels (Sticky-ish) */}
                    <div className="flex flex-col justify-between pt-8 pb-1 pr-2 h-[120px] text-[9px] font-bold text-slate-600 sticky left-0 bg-slate-950/0 backdrop-blur-[1px] z-10">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* Months Container */}
                    <div className="flex gap-8">
                        {months.map(monthStart => {
                            const monthEnd = endOfMonth(monthStart);
                            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

                            // Calculate offset for Mon-Start week (Mon=0...Sun=6)
                            // date-fns getDay: Sun=0, Mon=1...Sat=6
                            // We want Mon=0 to be top row.
                            // So we map: Mon(1)->0, Tue(2)->1... Sun(0)->6
                            let startDayIndex = getDay(monthStart);
                            // Convert to Mon-based index (0-6)
                            startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1;

                            return (
                                <div key={monthStart.toString()} className="flex flex-col gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                        {format(monthStart, 'MMM')}
                                    </span>

                                    <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                                        {/* Empty spacers for alignment */}
                                        {Array.from({ length: startDayIndex }).map((_, i) => (
                                            <div key={`spacer-${i}`} className="w-3 h-3" />
                                        ))}

                                        {/* Days */}
                                        {daysInMonth.map(day => {
                                            const intensity = getIntensity(day);
                                            const isFuture = day > today;
                                            return (
                                                <motion.div
                                                    key={day.toISOString()}
                                                    initial={false}
                                                    whileHover={{ scale: 1.3, zIndex: 10 }}
                                                    className={`
                                                        w-3 h-3 rounded-[3px] transition-all duration-300
                                                        ${getStyle(intensity, isFuture)}
                                                    `}
                                                    title={`${format(day, 'MMM do')}: ${intensity}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-3 mt-4 text-[10px] font-medium text-slate-500 px-4">
                <span>Less</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-[3px] bg-slate-800/40 border border-white/5" />
                    <div className="w-3 h-3 rounded-[3px] bg-indigo-900/80 border border-indigo-500/30" />
                    <div className="w-3 h-3 rounded-[3px] bg-violet-600 shadow-[0_0_8px_-2px_rgba(139,92,246,0.6)]" />
                    <div className="w-3 h-3 rounded-[3px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
