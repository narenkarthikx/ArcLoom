import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import {
    eachDayOfInterval,
    subMonths,
    format,
    startOfMonth,
    endOfMonth,
    getDay,
    isSameDay,
    startOfWeek,
    endOfWeek
} from 'date-fns';

export default function ActivityHeatmap({ logs = [] }) {
    // Config
    const monthsToShow = 4; // Show last 4 months
    const today = new Date();

    // Generate array of last N months (start dates)
    const months = Array.from({ length: monthsToShow }, (_, i) => {
        return subMonths(startOfMonth(today), monthsToShow - 1 - i);
    });

    // Process logs into a map
    const activityMap = {};
    logs.forEach(log => {
        const dateStr = format(new Date(log.completed_date), 'yyyy-MM-dd');
        if (!activityMap[dateStr]) {
            activityMap[dateStr] = { count: 0, colors: [] };
        }
        activityMap[dateStr].count += 1;
        if (log.habits?.color) activityMap[dateStr].colors.push(log.habits.color);
    });

    const getColor = (dateStr) => {
        const data = activityMap[dateStr];
        if (!data) return 'bg-slate-800/50 border border-white/5'; // Default empty day color

        if (data.count === 0) return 'bg-slate-800/50 border border-white/5';

        // Use the habit's color if available
        if (data.colors.length > 0) {
            return 'custom-color';
        }

        if (data.count === 1) return 'bg-indigo-900/60 border border-indigo-500/20';
        if (data.count === 2) return 'bg-indigo-700/80 border border-indigo-500/30';
        if (data.count === 3) return 'bg-indigo-500 border border-indigo-400/40';
        if (data.count >= 4) return 'bg-indigo-400 border border-indigo-300/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]';
        return 'bg-slate-800/50 border border-white/5';
    };

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-8 min-w-max px-2">
                {months.map((monthStart) => {
                    const monthEnd = endOfMonth(monthStart);
                    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

                    let startOffset = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;
                    const blanks = Array.from({ length: startOffset });

                    return (
                        <div key={monthStart.toString()} className="flex flex-col gap-2">
                            <h4 className="text-sm font-bold text-slate-400">{format(monthStart, 'MMMM yyyy')}</h4>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                    <span key={i} className="text-[10px] font-semibold text-slate-600 text-center">{d}</span>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {blanks.map((_, i) => (
                                    <div key={`blank-${i}`} className="w-6 h-6" /> // Placeholder
                                ))}

                                {daysInMonth.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const data = activityMap[dateStr];
                                    const colorClass = getColor(dateStr);
                                    const dynamicStyle = colorClass === 'custom-color' && data?.colors?.[0]
                                        ? { backgroundColor: data.colors[0], boxShadow: `0 0 8px ${data.colors[0]}80` }
                                        : {};

                                    return (
                                        <motion.div
                                            key={dateStr}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3, type: "spring" }}
                                            data-tooltip-id="heatmap-tooltip"
                                            data-tooltip-content={`${dateStr}: ${data?.count || 0} completions`}
                                            style={dynamicStyle}
                                            className={`
                                        w-6 h-6 rounded-md flex items-center justify-center text-[8px]
                                        transition-all hover:scale-125 hover:z-10 cursor-pointer
                                        ${colorClass !== 'custom-color' ? colorClass : ''}
                                    `}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
            <Tooltip
                id="heatmap-tooltip"
                className="z-50 !bg-slate-900 !text-slate-100 !px-3 !py-2 !rounded-lg !text-xs !border !border-white/10 !shadow-xl"
            />
        </div>
    );
}
