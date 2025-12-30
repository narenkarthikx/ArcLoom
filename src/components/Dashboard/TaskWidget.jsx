import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckSquare, Circle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskWidget() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Mock data
    const tasks = [
        { id: 1, title: 'Finish implementing auth', priority: 'high', completed: false },
        { id: 2, title: 'design system updates', priority: 'medium', completed: false },
        { id: 3, title: 'Reply to emails', priority: 'low', completed: true },
        { id: 4, title: 'Review PRs', priority: 'medium', completed: false },
    ];

    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                        <CheckSquare size={20} />
                    </div>
                    <h2 className="font-semibold text-slate-800">Priority Tasks</h2>
                </div>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all"
                    >
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Circle size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                        </div>
                        <div className={`
                            w-2 h-2 rounded-full
                            ${task.priority === 'high' ? 'bg-rose-500' : ''}
                            ${task.priority === 'medium' ? 'bg-amber-500' : ''}
                            ${task.priority === 'low' ? 'bg-emerald-500' : ''}
                        `} />
                    </motion.div>
                ))}

                {pendingTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <CheckCircle2 className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All caught up!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
