import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Sparkles, Sun, Moon, Sunset, Cloud, X, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { format, isSameDay } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

export default function HabitsPage() {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({});
    const [dailyLog, setDailyLog] = useState(null);
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
            await api.dailyLog.ensureToday();

            const [habitsData, logsData, todayLog] = await Promise.all([
                api.habits.list(),
                api.getHabitLogs(),
                api.dailyLog.getToday()
            ]);

            setHabits(habitsData);
            setDailyLog(todayLog);

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
            const { data, error } = await supabase
                .from('habits')
                .insert([{
                    name: newHabit,
                    color: '#6366f1',
                    user_id: (await supabase.auth.getUser()).data.user.id,
                    identity: 'consistent',
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

        // Optimistic update for UI
        let newLogs;
        if (isCompleted) {
            newLogs = logs.filter(d => !isSameDay(d, date));
            // Decrement daily log locally
            setDailyLog(prev => ({ ...prev, habits_done: Math.max(0, (prev?.habits_done || 0) - 1) }));
        } else {
            newLogs = [...logs, date];
            // Increment daily log locally
            setDailyLog(prev => ({ ...prev, habits_done: (prev?.habits_done || 0) + 1 }));
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

    // Time of day greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="max-w-2xl space-y-10 pb-32">

            {/* Day-Centric Header */}
            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-medium text-slate-100 mb-2">{greeting}, Naren.</h1>
                    <div className="flex items-center gap-3 text-slate-400">
                        <span className="text-3xl font-bold text-indigo-400">{dailyLog?.habits_done || 0}</span>
                        <span className="text-sm font-medium leading-tight">rituals completed<br />today.</span>
                    </div>
                </div>
                {/* Subtle decorative background gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between px-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Your Flow</h2>
                {!showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <Plus size={16} /> New Ritual
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
                        <form onSubmit={handleAddHabit} className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 space-y-6 mb-8">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-widest">Design New Ritual</span>
                                <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={newHabit}
                                onChange={e => setNewHabit(e.target.value)}
                                placeholder="What is the action?"
                                className="w-full bg-transparent text-xl font-medium text-slate-100 placeholder:text-slate-600 outline-none"
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

                            <button
                                type="submit"
                                disabled={!newHabit.trim()}
                                className="w-full py-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Commit to Layout
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Habits Stream - Clean List */}
            <div className="space-y-3">
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
                        <p>No rituals set for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function HabitItem({ habit, logs, toggle }) {
    const today = new Date();
    const isDoneToday = logs.some(d => isSameDay(d, today));

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
                group relative overflow-hidden rounded-2xl transition-all duration-500
                ${isDoneToday ? 'bg-slate-900/20 py-4 px-6 opacity-60' : 'bg-slate-900/60 py-6 px-6'}
                border border-white/5
            `}
        >
            <div className="relative z-10 flex items-center justify-between gap-4">

                {/* Info */}
                <div className="flex-1 min-w-0 flex items-center gap-4">
                    <button
                        onClick={() => toggle(habit.id, today)}
                        className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${isDoneToday
                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                : 'border-slate-600 text-transparent hover:border-indigo-400'
                            }
                        `}
                    >
                        <Check size={16} strokeWidth={4} />
                    </button>

                    <div>
                        <div className="flex items-center gap-2 mb-0.5 opacity-60">
                            {getTimeIcon(habit.time_anchor)}
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                {habit.time_anchor}
                            </span>
                        </div>
                        <h3 className={`text-lg font-medium truncate transition-colors duration-500 ${isDoneToday ? 'text-slate-500 line-through decoration-slate-700' : 'text-slate-200'}`}>
                            {habit.name}
                        </h3>
                    </div>
                </div>

                {/* Right Side: Simple visual anchor */}
                {!isDoneToday && (
                    <div className="text-slate-600">
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
