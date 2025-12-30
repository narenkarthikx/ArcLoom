import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { format, subDays, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

export default function HabitsPage() {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({});
    const [newHabit, setNewHabit] = useState('');
    const [loading, setLoading] = useState(true);

    // Stats
    const [totalCompletions, setTotalCompletions] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const habitsData = await api.habits.list();
            setHabits(habitsData);

            // Fetch logs for the last 365 days? Or just current month for now to keep it light
            // For MVP let's fetch all relevant logs
            // In a real app we'd paginate or filter by date range
            const { data: logsData, error } = await supabase
                .from('habit_logs')
                .select('*');

            if (error) throw error;

            // Group logs by habit_id
            const logsMap = {};
            logsData.forEach(log => {
                if (!logsMap[log.habit_id]) logsMap[log.habit_id] = [];
                logsMap[log.habit_id].push(new Date(log.completed_date));
            });
            setHabitLogs(logsMap);

            // Calc stats
            setTotalCompletions(logsData.length);
            // Rough streak calc (global) not implemented yet, just total counts
        } catch (error) {
            console.error('Error loading habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;

        try {
            // Pick a random color for the habit
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const { data, error } = await supabase
                .from('habits')
                .insert([{ name: newHabit, color: randomColor, user_id: (await supabase.auth.getUser()).data.user.id }])
                .select()
                .single();

            if (error) throw error;
            setHabits([data, ...habits]);
            setNewHabit('');
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    };

    const toggleHabit = async (habitId, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const logs = habitLogs[habitId] || [];
        const isCompleted = logs.some(d => isSameDay(d, date));

        try {
            if (isCompleted) {
                // Remove completion
                await supabase
                    .from('habit_logs')
                    .delete()
                    .match({ habit_id: habitId, completed_date: dateStr });

                setHabitLogs({
                    ...habitLogs,
                    [habitId]: logs.filter(d => !isSameDay(d, date))
                });
                setTotalCompletions(prev => prev - 1);
            } else {
                // Add completion
                await supabase
                    .from('habit_logs')
                    .insert([{ habit_id: habitId, completed_date: dateStr }]);

                setHabitLogs({
                    ...habitLogs,
                    [habitId]: [...logs, date]
                });
                setTotalCompletions(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const deleteHabit = async (id) => {
        if (!confirm('Are you sure? All history for this habit will be lost.')) return;
        try {
            await supabase.from('habits').delete().eq('id', id);
            setHabits(habits.filter(h => h.id !== id));
            const newLogs = { ...habitLogs };
            delete newLogs[id];
            setHabitLogs(newLogs);
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    };

    // Generate last 7 days for the weekly view
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Habit Tracker</h1>
                    <p className="text-slate-500">Build consistency, one day at a time</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span className="font-semibold">{totalCompletions}</span>
                        <span className="text-xs opacity-70">Total completions</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <form onSubmit={handleAddHabit} className="flex gap-4">
                    <input
                        type="text"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        placeholder="New habit (e.g., Read 30 mins)"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Habit
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {habits.map((habit, index) => (
                    <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-6"
                    >
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                                <h3 className="font-semibold text-slate-800">{habit.name}</h3>
                            </div>
                            <button
                                onClick={() => deleteHabit(habit.id)}
                                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 mt-1 transition-colors"
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {last7Days.map((date) => {
                                const isCompleted = habitLogs[habit.id]?.some(logDate => isSameDay(logDate, date));
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => toggleHabit(habit.id, date)}
                                        className={`
                                    w-10 h-10 rounded-lg flex flex-col items-center justify-center border transition-all relative
                                    ${isCompleted
                                                ? `bg-opacity-10 text-white border-transparent`
                                                : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-400'
                                            }
                                    ${isToday ? 'ring-2 ring-offset-2 ring-indigo-100' : ''}
                                `}
                                        style={{
                                            backgroundColor: isCompleted ? habit.color : undefined,
                                        }}
                                    >
                                        <span className={`text-[10px] font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                                            {format(date, 'EEE')}
                                        </span>
                                        {isCompleted && (
                                            <CheckCircle2 size={14} className="text-white mt-0.5" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}

                {habits.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400">
                        <Flame size={40} className="mx-auto mb-3 opacity-20" />
                        <p>Start your first streak today!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
