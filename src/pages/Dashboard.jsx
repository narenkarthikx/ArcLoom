import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Flame, CalendarClock } from 'lucide-react';
import ActivityHeatmap from '../components/Dashboard/ActivityHeatmap';
import StatCard from '../components/Dashboard/StatCard';

// Dummy data for visual population
const dummyLogs = [
    { completed_date: new Date().toISOString(), habits: { color: '#6366f1' } }
];

export default function Dashboard() {
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
                <StatCard title="Habits Active" value="8" subtext="+2 from last week" icon={Flame} color="rose" />
                <StatCard title="Tasks Done" value="12" subtext="4 pending today" icon={CheckCircle2} color="emerald" />
                <StatCard title="Activity Score" value="85%" subtext="Consistent" icon={Activity} color="indigo" />
                <StatCard title="Upcoming" value="3" subtext="Events this week" icon={CalendarClock} color="violet" />
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
                        <h2 className="text-xl font-bold text-slate-200">Activity Heatmap</h2>
                    </div>
                </div>

                <ActivityHeatmap logs={dummyLogs} />
            </motion.section>
        </div>
    );
}
