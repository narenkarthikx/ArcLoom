import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Zap, Battery, BatteryMedium, BatteryLow, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [energyLevel, setEnergyLevel] = useState('focus'); // focus, light, admin
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await api.tasks.list();
            setTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const task = await api.tasks.create({
                title: newTask,
                energy_level: energyLevel,
                priority: 'medium', // Defaulting for now
                is_completed: false,
                postponed_count: 0,
                due_date: new Date().toISOString()
            });
            setTasks([task, ...tasks]);
            setNewTask('');
        } catch (error) {
            console.error(error);
        }
    };

    const toggleTask = async (id, currentStatus) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
        try {
            await api.tasks.update(id, { is_completed: !currentStatus });
        } catch (error) {
            console.error(error);
            loadTasks();
        }
    };

    const deleteTask = async (id) => {
        if (!confirm("Delete this task?")) return;
        try {
            await api.tasks.delete(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    // Group tasks by Energy Level for "Energy-Based Sorting"
    const focusTasks = tasks.filter(t => !t.is_completed && t.energy_level === 'focus');
    const adminTasks = tasks.filter(t => !t.is_completed && t.energy_level === 'admin');
    const lightTasks = tasks.filter(t => !t.is_completed && t.energy_level === 'light');
    const completedTasks = tasks.filter(t => t.is_completed);

    return (
        <div className="max-w-6xl mx-auto min-h-[calc(100vh-6rem)] pb-20">

            {/* Header / Insight */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-100 mb-2">Execution Engine</h1>
                <p className="text-slate-400 font-medium text-lg">Align your effort with your energy.</p>

                {focusTasks.length > 0 && (
                    <div className="mt-6 inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-5 py-3 rounded-2xl">
                        <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                        <span className="font-bold">Insight:</span>
                        <span>You have {focusTasks.length} deep work items. Best done before 11 AM.</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2rem] shadow-lg border border-white/5 mb-10 flex flex-col md:flex-row gap-2 relative z-20">
                <form onSubmit={handleAddTask} className="flex-1 flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-1 px-6 py-4 bg-transparent text-xl font-bold placeholder:text-slate-500 text-slate-200 outline-none"
                    />

                    <div className="flex bg-white/5 rounded-xl p-1.5 self-center mx-2 border border-white/5">
                        {['focus', 'admin', 'light'].map(level => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setEnergyLevel(level)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${energyLevel === level
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="bg-slate-100 text-slate-900 px-8 py-3 rounded-2xl font-black hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Execute
                    </button>
                </form>
            </div>

            {/* Energy Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {/* 1. Deep Work Zone */}
                <section>
                    <h3 className="flex items-center gap-2 font-black text-slate-300 mb-6 text-xl">
                        <Battery className="text-rose-500 fill-rose-500" /> Deep Work
                        <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg ml-auto">{focusTasks.length}</span>
                    </h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {focusTasks.map(task => (
                                <TaskCard key={task.id} task={task} toggle={toggleTask} del={deleteTask} type="focus" />
                            ))}
                            {focusTasks.length === 0 && <EmptyState type="Focus" />}
                        </AnimatePresence>
                    </div>
                </section>

                {/* 2. Admin / Chores Zone */}
                <section>
                    <h3 className="flex items-center gap-2 font-black text-slate-300 mb-6 text-xl">
                        <BatteryMedium className="text-amber-500 fill-amber-500" /> Admin
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg ml-auto">{adminTasks.length}</span>
                    </h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {adminTasks.map(task => (
                                <TaskCard key={task.id} task={task} toggle={toggleTask} del={deleteTask} type="admin" />
                            ))}
                            {adminTasks.length === 0 && <EmptyState type="Admin" />}
                        </AnimatePresence>
                    </div>
                </section>

                {/* 3. Quick Wins Zone */}
                <section>
                    <h3 className="flex items-center gap-2 font-black text-slate-300 mb-6 text-xl">
                        <BatteryLow className="text-emerald-500 fill-emerald-500" /> Light
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg ml-auto">{lightTasks.length}</span>
                    </h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {lightTasks.map(task => (
                                <TaskCard key={task.id} task={task} toggle={toggleTask} del={deleteTask} type="light" />
                            ))}
                            {lightTasks.length === 0 && <EmptyState type="Light" />}
                        </AnimatePresence>
                    </div>
                </section>
            </div>

            {/* Completed Feedback */}
            {completedTasks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-block bg-slate-800 border border-white/5 text-slate-300 px-6 py-3 rounded-full font-bold shadow-lg">
                        ✨ You moved your arc forward today with {completedTasks.length} completions.
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function TaskCard({ task, toggle, del, type }) {
    const friction = task.postponed_count > 0;

    const getBorderColor = () => {
        if (type === 'focus') return 'border-rose-500/20 group-hover:border-rose-500/40';
        if (type === 'admin') return 'border-amber-500/20 group-hover:border-amber-500/40';
        return 'border-emerald-500/20 group-hover:border-emerald-500/40';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
                bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border transition-all relative group
                ${getBorderColor()}
            `}
        >
            {/* Friction Indicator */}
            {friction && (
                <div className="absolute -top-3 -right-2 bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                    <AlertCircle size={10} /> Postponed {task.postponed_count}x
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={() => toggle(task.id, task.is_completed)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-600 hover:border-indigo-500 flex items-center justify-center transition-colors mt-1"
                >
                    {task.is_completed && <Check size={14} className="text-indigo-400" />}
                </button>
                <div className="flex-1">
                    <p className="font-bold text-slate-200 leading-snug">{task.title}</p>

                    {/* Outcome / Context Link */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            Goal driven
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => del(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
}

function EmptyState({ type }) {
    return (
        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl opacity-50">
            <p className="text-sm font-medium text-slate-500">No {type} tasks</p>
        </div>
    );
}
