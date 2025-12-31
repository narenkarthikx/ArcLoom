import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Trash2, Zap, Coffee, Briefcase, User, Info } from 'lucide-react';
import { format, isSameDay, parseISO, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { api } from '../lib/api';

export default function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('09:00');
    const [eventDuration, setEventDuration] = useState(60);
    const [eventType, setEventType] = useState('deep-work'); // deep-work, shallow, personal, recovery

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            // Mock API call or use real if connected
            // const data = await api.events.list();
            setEvents([]); // Placeholder
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const startDateTime = new Date(date);
        const [hours, minutes] = eventTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes));
        const endDateTime = new Date(startDateTime.getTime() + eventDuration * 60000);

        const newEvent = {
            id: Date.now(),
            title: eventTitle,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            type: eventType
        };

        setEvents([...events, newEvent]);
        setShowAddModal(false);
        setEventTitle('');
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm("Remove this block?")) return;
        setEvents(events.filter(e => e.id !== id));
    };

    const selectedDayEvents = events
        .filter(event => isSameDay(parseISO(event.start_time), date))
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // Time Bucket Logic
    const getTypeStyles = (type) => {
        switch (type) {
            case 'deep-work': return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: <Zap size={14} /> };
            case 'shallow': return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: <Briefcase size={14} /> };
            case 'personal': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <User size={14} /> };
            case 'recovery': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Coffee size={14} /> };
            default: return { bg: 'bg-slate-800/50', border: 'border-white/5', text: 'text-slate-400', icon: <Clock size={14} /> };
        }
    };

    const calculateWeeklyCapacity = () => {
        const start = startOfWeek(new Date());
        const end = endOfWeek(new Date());
        let totalMinutes = 0;

        events.forEach(e => {
            const eDate = parseISO(e.start_time);
            if (eDate >= start && eDate <= end) {
                totalMinutes += differenceInMinutes(parseISO(e.end_time), parseISO(e.start_time));
            }
        });
        return Math.round(totalMinutes / 60);
    };

    const weeklyHours = calculateWeeklyCapacity();
    const capacityLimit = 40;
    const isOverCapacity = weeklyHours > capacityLimit;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col xl:flex-row gap-8 overflow-hidden">

            {/* LEFT: Calendar Strategy Card */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col relative overflow-hidden"
            >
                <div className="flex justify-between items-start mb-8 z-10 relative">
                    <div>
                        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Time Strategy</h1>
                        <p className="text-slate-400 font-medium mt-1">Design your week intentionally.</p>

                        {isOverCapacity ? (
                            <div className="mt-4 inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-xl text-sm font-bold animate-pulse">
                                <Info size={16} />
                                You’re {weeklyHours - capacityLimit}h over realistic capacity.
                            </div>
                        ) : (
                            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl text-sm font-bold">
                                <Zap size={16} />
                                {capacityLimit - weeklyHours}h available for Deep Work.
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center custom-calendar-wrapper z-10 relative">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        tileClassName={({ date: tileDate }) => {
                            const hasEvent = events.some(e => isSameDay(parseISO(e.start_time), tileDate));
                            const isToday = isSameDay(tileDate, new Date());
                            return `rounded-xl ${hasEvent ? 'font-bold text-indigo-400' : ''} ${isToday ? 'bg-indigo-500/20 text-indigo-300' : ''}`;
                        }}
                    />
                </div>
            </motion.div>

            {/* RIGHT: Timeline / Bucket View */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="xl:w-[450px] bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 flex flex-col relative"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {format(date, 'EEEE')}
                        </span>
                        <span className="text-4xl font-black text-slate-200 block">
                            {format(date, 'MMM d')}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-rose-400" title="Deep Work" />
                        <div className="w-3 h-3 rounded-full bg-indigo-400" title="Shallow" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" title="Personal" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map((event, index) => {
                            const type = event.type || 'shallow';
                            const styles = getTypeStyles(type);

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-5 rounded-2xl border ${styles.bg} ${styles.border} relative group`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-bold text-lg leading-tight ${styles.text}`}>{event.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className={`p-1 rounded-md bg-white/5 border border-white/5 ${styles.text}`}>
                                                    {styles.icon}
                                                </div>
                                                <span className={`text-xs font-bold uppercase tracking-wide opacity-70 ${styles.text}`}>
                                                    {type.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="text-slate-500 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500">
                                        <Clock size={12} />
                                        {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-3xl">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/5">
                                <Zap size={24} className="text-slate-400" />
                            </div>
                            <p className="text-lg font-bold text-slate-300">Wide open.</p>
                            <p className="text-slate-500 text-sm mt-1"> Perfect for Deep Work.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-6 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors"
                            >
                                Schedule a Block
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <h2 className="text-2xl font-black text-white mb-6">Block Time</h2>
                                <form onSubmit={handleAddEvent} className="space-y-6">

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Focus</label>
                                        <input
                                            required
                                            type="text"
                                            value={eventTitle}
                                            onChange={e => setEventTitle(e.target.value)}
                                            placeholder="What are you working on?"
                                            className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none font-bold text-slate-200 placeholder-slate-600 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['deep-work', 'shallow', 'personal', 'recovery'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setEventType(t)}
                                                    className={`py-3 rounded-xl text-xs font-bold uppercase transition-all border ${eventType === t
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                                                        : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    {t.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-2 block">Start</label>
                                            <input
                                                type="time"
                                                value={eventTime}
                                                onChange={e => setEventTime(e.target.value)}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl font-bold text-slate-300 outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-2 block">Duration (m)</label>
                                            <input
                                                type="number"
                                                value={eventDuration}
                                                onChange={e => setEventDuration(e.target.value)}
                                                step="15"
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl font-bold text-slate-300 outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 hover:text-slate-300 font-bold transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-xl hover:bg-indigo-500 transition-all hover:shadow-indigo-500/30">Confirm Block</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
