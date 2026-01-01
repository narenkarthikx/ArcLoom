import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Flame, CalendarClock } from 'lucide-react';
import YearlyHeatmap from '../components/Dashboard/YearlyHeatmap';
import StatCard from '../components/Dashboard/StatCard';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
    const [stats, setStats] = useState({
        habitsActive: 0,
        tasksDone: 0,
        pendingTasks: 0,
        activityScore: 0,
        upcomingEvents: 0
    });
    const [heatmapLogs, setHeatmapLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // parallel data fetching
                const [
                    habits,
                    tasks,
                    todayLog,
                    logsHistory
                ] = await Promise.all([
                    api.habits.list(),
                    api.tasks.list(),
                    api.dailyLog.getToday(),
                    supabase.from('daily_log').select('date, habits_done, tasks_done').gte('date', `${new Date().getFullYear()}-01-01`)
                ]);

                // Calculate Stats
                const activeHabits = habits.length;
                const tasksCompletedToday = todayLog?.tasks_done || 0;
                const pendingTasksCount = tasks.filter(t => !t.is_completed).length;

                // Simple Activity Score: (Habits Done Today / Total Habits) * 100
                // This is a naive calculation for "Today's" score. Could be average over time.
                const score = activeHabits > 0 ? Math.round(((todayLog?.habits_done || 0) / activeHabits) * 100) : 0;

                setStats({
                    habitsActive: activeHabits,
                    tasksDone: tasksCompletedToday,
                    pendingTasks: pendingTasksCount,
                    activityScore: score,
                    upcomingEvents: 0 // TODO: Connect to real events API when ready
                });

                setHeatmapLogs(logsHistory.data || []);

            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <div className="flex justify-between items-end">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold text-white tracking-tight"
                        >
                            Overview
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 mt-2 text-lg"
                        >
                            Your daily weaving progress.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-right hidden md:block"
                    >
                        <p className="text-sm text-slate-500 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Habits Active"
                    value={stats.habitsActive}
                    subtext="Rituals in rotation"
                    icon={Flame}
                    color="rose"
                />
                <StatCard
                    title="Tasks Cleared"
                    value={stats.tasksDone}
                    subtext={`${stats.pendingTasks} pending execution`}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Daily Consistency"
                    value={`${stats.activityScore}%`}
                    subtext="Ritual completion"
                    icon={Activity}
                    color="indigo"
                />
                <StatCard
                    title="Upcoming"
                    value={stats.upcomingEvents}
                    subtext="Events scheduled"
                    icon={CalendarClock}
                    color="violet"
                />
            </div>


            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-200">{new Date().getFullYear()} Consistency</h2>
                            <p className="text-xs text-slate-500 font-medium">Every block is a day you showed up.</p>
                        </div>
                    </div>
                </div>

                <YearlyHeatmap logs={heatmapLogs} />
            </motion.section>
        </div>
    );
}
