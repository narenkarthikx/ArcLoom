import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Flame } from 'lucide-react';

export default function HabitWidget() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Mock data
    const habits = [
        { id: 1, name: 'Morning Jog', streak: 12, completedToday: true, color: 'bg-orange-500' },
        { id: 2, name: 'Read 30 mins', streak: 5, completedToday: false, color: 'bg-blue-500' },
        { id: 3, name: 'Drink Water', streak: 24, completedToday: true, color: 'bg-cyan-500' },
    ];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <Activity size={20} />
                    </div>
                    <h2 className="font-semibold text-slate-800">Active Habits</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {habits.map((habit, index) => (
                    <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${habit.completedToday ? 'bg-slate-100' : habit.color + '/10'}`}>
                                <div className={`w-3 h-3 rounded-full ${habit.completedToday ? 'bg-slate-300' : habit.color}`} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    {habit.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Flame size={12} className="text-orange-500" />
                                    <span>{habit.streak} day streak</span>
                                </div>
                            </div>
                        </div>

                        <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${habit.completedToday
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-200 group-hover:border-indigo-400'
                            }
                        `}>
                            {habit.completedToday && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3.5 h-3.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
