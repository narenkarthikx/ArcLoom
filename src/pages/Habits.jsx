import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, User, Heart, Sun, Sunset, Moon } from 'lucide-react';
import { api } from '../lib/api';
import { format, subDays, isSameDay } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

export default function HabitsPage() {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({});
    const [newHabit, setNewHabit] = useState('');
    const [identity, setIdentity] = useState('');
    const [timeAnchor, setTimeAnchor] = useState('anytime');
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);

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
            const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const { data, error } = await supabase
                .from('habits')
                .insert([{
                    name: newHabit,
                    color: randomColor,
                    user_id: (await supabase.auth.getUser()).data.user.id,
                    identity: identity || 'someone who improves daily',
                    time_anchor: timeAnchor
                }])
                .select()
                .single();

            if (error) throw error;
            setHabits([data, ...habits]);
            setNewHabit(''); setIdentity('');
            setShowAdd(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleHabit = async (habitId, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const logs = habitLogs[habitId] || [];
        const isCompleted = logs.some(d => isSameDay(d, date));

        try {
            if (isCompleted) {
                setHabitLogs({ ...habitLogs, [habitId]: logs.filter(d => !isSameDay(d, date)) });
                await supabase.from('habit_logs').delete().match({ habit_id: habitId, completed_date: dateStr });
            } else {
                setHabitLogs({ ...habitLogs, [habitId]: [...logs, date] });
                await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_date: dateStr }]);
            }
        } catch (error) {
            console.error(error);
            loadData();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-100 mb-2">Consistency Lab</h1>
                <p className="text-slate-400 font-medium text-lg">Build the identity of the person you want to become.</p>
            </div>

            {/* Quick Add Fab */}
            {!showAdd && (
                <button
                    onClick={() => setShowAdd(true)}
                    className="group flex items-center gap-3 text-lg font-bold text-slate-400 hover:text-indigo-400 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-indigo-500/20 border border-white/5 flex items-center justify-center transition-colors">
                        <Plus size={24} />
                    </div>
                    Design new habit
                </button>
            )}

            {/* Add Panel */}
            <AnimatePresence>
                {showAdd && (
                    <motion.form
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleAddHabit}
                        className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] text-white shadow-2xl border border-white/5 relative overflow-hidden"
                    >
                        <h3 className="text-xl font-bold mb-6 text-slate-200">Habit Design Protocol</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Action</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newHabit}
                                        onChange={e => setNewHabit(e.target.value)}
                                        placeholder="e.g. Read 10 pages"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Identity (Who does this?)</label>
                                    <input
                                        type="text"
                                        value={identity}
                                        onChange={e => setIdentity(e.target.value)}
                                        placeholder="I am a reader..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Time Anchor</label>
                                <div className="flex gap-2">
                                    {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTimeAnchor(t)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all border ${timeAnchor === t
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-4">
                                <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-white">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-indigo-50 transition-colors">Initialize Habit</button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Habits List */}
            <div className="space-y-6">
                {habits.map((habit, idx) => (
                    <HabitCard
                        key={habit.id}
                        habit={habit}
                        logs={habitLogs[habit.id] || []}
                        toggle={toggleHabit}
                    />
                ))}
            </div>
        </div>
    );
}

function HabitCard({ habit, logs, toggle }) {
    // 7 Day view
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

    // Checks for missed yesterday
    const yesterday = subDays(new Date(), 1);
    const missedYesterday = !logs.some(d => isSameDay(d, yesterday));
    const doneToday = logs.some(d => isSameDay(d, new Date()));

    const getAnchorIcon = (anchor) => {
        if (anchor === 'morning') return <Sun size={14} className="text-amber-400" />;
        if (anchor === 'afternoon') return <Sun size={14} className="text-orange-400" />;
        if (anchor === 'evening') return <Sunset size={14} className="text-indigo-400" />;
        return <Moon size={14} className="text-slate-400" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
        >
            <div className="flex flex-col md:flex-row gap-8 relative z-10">

                {/* Identity & Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                            {getAnchorIcon(habit.time_anchor)}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                            {habit.time_anchor || 'Anytime'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-200 mb-1">{habit.name}</h2>
                    <p className="text-slate-500 font-medium italic flex items-center gap-2">
                        <User size={14} />
                        {habit.identity || "Identity not set"}
                    </p>

                    {/* Compassion Mode Message */}
                    {missedYesterday && !doneToday && (
                        <div className="mt-4 flex items-center gap-2 text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl text-xs font-bold max-w-max">
                            <Heart size={14} fill="currentColor" />
                            You missed yesterday. Resume today — streak is still alive.
                        </div>
                    )}
                </div>

                {/* Tracking Grid */}
                <div>
                    <div className="flex gap-2">
                        {days.map(date => {
                            const isDone = logs.some(d => isSameDay(d, date));
                            const isToday = isSameDay(date, new Date());
                            return (
                                <button
                                    key={date.toString()}
                                    onClick={() => toggle(habit.id, date)}
                                    className={`
                                        w-10 h-12 rounded-xl flex items-center justify-center border-2 transition-all
                                        ${isDone
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                            : 'bg-white/5 border-white/5 text-slate-600 hover:border-indigo-500/50'
                                        }
                                        ${isToday ? 'scale-110 mx-1 border-slate-500' : ''}
                                    `}
                                >
                                    {isDone && <Check size={18} strokeWidth={4} />}
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-right text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">
                        Last 7 Days
                    </p>
                </div>

            </div>
        </motion.div>
    );
}
