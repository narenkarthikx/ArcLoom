import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarWidget() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Mock data for MVP
    const events = [
        { id: 1, title: 'Team Sync', time: new Date().setHours(10, 0), type: 'work' },
        { id: 2, title: 'Lunch with Sarah', time: new Date().setHours(12, 30), type: 'personal' },
        { id: 3, title: 'Project Review', time: new Date().setHours(14, 0), type: 'work' },
    ];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <CalendarIcon size={20} />
                    </div>
                    <h2 className="font-semibold text-slate-800">Today's Schedule</h2>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    {format(new Date(), 'EEE, MMM d')}
                </span>
            </div>

            <div className="space-y-4">
                {events.length > 0 ? (
                    events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                            <div className="flex-col items-center gap-1 min-w-[60px] hidden sm:flex">
                                <span className="text-sm font-semibold text-slate-700">
                                    {format(event.time, 'h:mm')}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {format(event.time, 'a')}
                                </span>
                            </div>

                            <div className="relative pl-4 border-l-2 border-indigo-100 group-hover:border-indigo-500 transition-colors">
                                <h3 className="text-sm font-medium text-slate-800">{event.title}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">
                                        {format(event.time, 'h:mm a')} • {event.type}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p>No events scheduled for today</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
