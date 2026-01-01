import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Sparkles, Sun, Moon, Sunset, Cloud, X } from 'lucide-react';
import { api } from '../lib/api';
import { format, subDays, isSameDay } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

export default function HabitsPage() {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({});
    const [loading, setLoading] = useState(true);

    // Form State
    const [showAdd, setShowAdd] = useState(false);
    const [newHabit, setNewHabit] = useState('');
    const [timeContext, setTimeContext] = useState('anytime');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const habitsData = await api.habits.list();
            setHabits(habitsData);
            const logsData = await api.getHabitLogs();

            const logsMap = {};
            logsData.forEach(log => {
                const date = new Date(log.completed_date);
                if (!logsMap[log.habit_id]) logsMap[log.habit_id] = [];
                logsMap[log.habit_id].push(date);
            });
            setHabitLogs(logsMap);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;

        try {
            // Simplified "Identity" for now to reduce friction, can be added back if needed or defaulted
            const { data, error } = await supabase
                .from('habits')
                .insert([{
                    name: newHabit,
                    color: '#6366f1', // Default calm indigo
                    user_id: (await supabase.auth.getUser()).data.user.id,
                    identity: 'a consistent person', // Default
                    time_anchor: timeContext
                }])
                .select()
                .single();

            if (error) throw error;
            setHabits([data, ...habits]);
            setNewHabit('');
            setShowAdd(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleHabit = async (habitId, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const logs = habitLogs[habitId] || [];
        const isCompleted = logs.some(d => isSameDay(d, date));

        // Optimistic update
        let newLogs;
        if (isCompleted) {
            newLogs = logs.filter(d => !isSameDay(d, date));
        } else {
            newLogs = [...logs, date];
        }
        setHabitLogs({ ...habitLogs, [habitId]: newLogs });

        try {
            if (isCompleted) {
                await supabase.from('habit_logs').delete().match({ habit_id: habitId, completed_date: dateStr });
            } else {
                await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_date: dateStr }]);
            }
        } catch (error) {
            console.error(error);
            loadData(); // Revert on error
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 pb-32">
            {/* Soft Header */}
            <div className="flex items-end justify-between px-2">
                <div>
                    <h1 className="text-3xl font-medium text-slate-100 mb-1">Daily Rituals</h1>
                    <p className="text-slate-400 text-sm">Small actions, repeated.</p>
                </div>
                {!showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            {/* Add Habit Overlay */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleAddHabit} className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 space-y-6">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-widest">New Ritual</span>
                                <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={newHabit}
                                onChange={e => setNewHabit(e.target.value)}
                                placeholder="I want to..."
                                className="w-full bg-transparent text-2xl font-medium text-slate-100 placeholder:text-slate-600 outline-none"
                            />

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTimeContext(t)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${timeContext === t
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                            }`}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={!newHabit.trim()}
                                    className="w-full py-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Begin
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Habits Stream */}
            <div className="space-y-4">
                {habits.map(habit => (
                    <HabitItem
                        key={habit.id}
                        habit={habit}
                        logs={habitLogs[habit.id] || []}
                        toggle={toggleHabit}
                    />
                ))}

                {habits.length === 0 && !loading && (
                    <div className="text-center py-20 text-slate-500 font-light">
                        <Sparkles className="mx-auto mb-4 opacity-20" size={48} />
                        <p>No rituals yet.</p>
                        <button onClick={() => setShowAdd(true)} className="mt-4 text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30">Start one?</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function HabitItem({ habit, logs, toggle }) {
    const today = new Date();
    const isDoneToday = logs.some(d => isSameDay(d, today));

    // Last 5 days for context (excluding today)
    const recentHistory = Array.from({ length: 5 }, (_, i) => subDays(today, 5 - i));

    const getTimeIcon = (time) => {
        switch (time) {
            case 'morning': return <Sun size={14} className="text-amber-300/70" />;
            case 'afternoon': return <Cloud size={14} className="text-sky-300/70" />;
            case 'evening': return <Sunset size={14} className="text-indigo-300/70" />;
            default: return <Sparkles size={14} className="text-slate-400/70" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                group relative overflow-hidden rounded-[2rem] p-1 transition-all duration-500
                ${isDoneToday ? 'bg-slate-800/40' : 'bg-slate-900/40'}
            `}
        >
            <div className="relative z-10 flex items-center justify-between p-4 px-6 gap-4">

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                        {getTimeIcon(habit.time_anchor)}
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                            {habit.time_anchor}
                        </span>
                    </div>
                    <h3 className={`text-lg font-medium truncate transition-colors duration-500 ${isDoneToday ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>
                        {habit.name}
                    </h3>
                </div>

                {/* Right Side: Action & History */}
                <div className="flex items-center gap-6">

                    {/* Subtle History Dots */}
                    <div className="hidden sm:flex gap-1.5 opacity-40">
                        {recentHistory.map(day => {
                            const isDone = logs.some(l => isSameDay(l, day));
                            return (
                                <div
                                    key={day.toString()}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${isDone ? 'bg-indigo-400' : 'bg-slate-700'}`}
                                    title={format(day, 'MMM d')}
                                />
                            );
                        })}
                    </div>

                    {/* Main Action */}
                    <button
                        onClick={() => toggle(habit.id, today)}
                        className={`
                            relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                            ${isDoneToday
                                ? 'bg-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-300'
                            }
                        `}
                    >
                        <AnimatePresence mode='wait'>
                            {isDoneToday ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    exit={{ scale: 0.5, rotate: 20, opacity: 0 }}
                                >
                                    <Check size={28} strokeWidth={3} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-4 h-4 rounded-full border-2 border-current opacity-50"
                                />
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Ambient Glow for Done State */}
            <div
                className={`
                    absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none transition-opacity duration-700
                    ${isDoneToday ? 'opacity-100' : 'opacity-0'}
                `}
            />
        </motion.div>
    );
}
