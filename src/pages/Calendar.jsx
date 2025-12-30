import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Clock, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { api } from '../lib/api';

// Custom styles for the calendar
import '../calendar.css';

export default function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New event form
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('09:00');
    const [eventDuration, setEventDuration] = useState(60); // minutes

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await api.events.list();
            setEvents(data);
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

        try {
            const newEvent = await api.events.create({
                title: eventTitle,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                type: 'other'
            });
            setEvents([...events, newEvent]);
            setShowAddModal(false);
            setEventTitle('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await api.events.delete(id);
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const selectedDayEvents = events.filter(event =>
        isSameDay(parseISO(event.start_time), date)
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-6rem)]">
            {/* Calendar Section */}
            <div className="lg:w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Event
                    </button>
                </div>

                <div className="flex-1 flex justify-center custom-calendar-wrapper">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        className="w-full border-none font-sans"
                        tileClassName={({ date: tileDate }) => {
                            const hasEvent = events.some(e => isSameDay(parseISO(e.start_time), tileDate));
                            return hasEvent ? 'has-event' : '';
                        }}
                    />
                </div>
            </div>

            {/* Events Sidebar */}
            <div className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-4 pb-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {format(date, 'MMM d, yyyy')}
                    </h2>
                    <p className="text-slate-500 text-sm">{format(date, 'EEEE')}</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(event => (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={event.id}
                                className="group p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 transition-colors relative"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-slate-800">{event.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-indigo-600 font-medium">
                                            <Clock size={12} />
                                            {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No events for this day</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Event Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Add Event</h2>
                                <form onSubmit={handleAddEvent} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={eventTitle}
                                            onChange={e => setEventTitle(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                            <input
                                                required
                                                type="time"
                                                value={eventTime}
                                                onChange={e => setEventTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                                            <input
                                                required
                                                type="number"
                                                value={eventDuration}
                                                onChange={e => setEventDuration(e.target.value)}
                                                step="15"
                                                min="15"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                        >
                                            Save
                                        </button>
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
