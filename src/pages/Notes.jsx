import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link2, Sparkles, X, Trash2, Target } from 'lucide-react';
import { api } from '../lib/api';
import { format } from 'date-fns';

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Editor
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isReflection, setIsReflection] = useState(false);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await api.notes.list();
            setNotes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (autoClose = true) => {
        if (!title.trim() && !content.trim()) return;
        try {
            if (selectedNote && selectedNote.id !== 'new') {
                const updated = await api.notes.update(selectedNote.id, { title, content });
                setNotes(notes.map(n => n.id === updated.id ? updated : n));
            } else {
                const created = await api.notes.create({
                    title: title || 'Untitled Idea',
                    content,
                });
                setNotes([created, ...notes]);
                if (!autoClose) return created;
            }
            if (autoClose) closeEditor();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNote = async (id) => {
        if (!confirm("Discard this thought?")) return;
        try {
            await api.notes.delete(id);
            setNotes(notes.filter(n => n.id !== id));
            if (selectedNote?.id === id) closeEditor();
        } catch (err) {
            console.error(err);
        }
    };

    const openNote = (note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content || '');
        setIsReflection(note.title?.includes('Reflection')); // Simple check
    };

    const createNote = () => {
        setSelectedNote({ id: 'new' });
        setTitle('');
        setContent('');
        setIsReflection(false);
    };

    const startThoughtCapture = () => {
        createNote();
        setTitle(`Quick Capture ${format(new Date(), 'HH:mm')}`);
    };

    const startReflection = () => {
        createNote();
        setIsReflection(true);
        setTitle(`Weekly Reflection - ${format(new Date(), 'MMM d')}`);
        setContent(`## What worked?\n\n\n## What didn't?\n\n\n## What to change?\n`);
    };

    const closeEditor = () => {
        setSelectedNote(null);
    };

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] flex flex-col pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-100 tracking-tight">Thinking Space</h1>
                    <p className="text-slate-400 font-medium">Connect ideas to action.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={startReflection} className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-sm hover:bg-indigo-500/20 transition-colors flex items-center gap-2">
                        <Sparkles size={16} /> Weekly Reflection
                    </button>
                    <button onClick={startThoughtCapture} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm hover:bg-white transition-colors shadow-lg shadow-white/10">
                        + Quick Capture
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-8 relative">
                <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search your mind..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm text-lg font-medium text-slate-200 placeholder-slate-600"
                />
            </div>

            {/* Note Grid */}
            <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    <AnimatePresence>
                        {filteredNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => openNote(note)}
                                className="break-inside-avoid bg-slate-900/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/5 hover:border-white/10 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <h3 className="font-bold text-lg text-slate-200 mb-2 leading-tight">{note.title}</h3>
                                <p className="text-slate-400 text-sm line-clamp-6 leading-relaxed whitespace-pre-line">
                                    {note.content}
                                </p>

                                <div className="mt-4 flex items-center justify-between opacity-50 text-xs font-bold text-slate-500">
                                    <span>{format(new Date(note.updated_at), 'MMM d')}</span>
                                    {note.title.includes('Reflection') && <Sparkles size={12} className="text-indigo-400" />}
                                </div>
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredNotes.length === 0 && !loading && (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-slate-500">Your mind is clear.</p>
                    </div>
                )}
            </div>

            {/* Modal Editor */}
            <AnimatePresence>
                {selectedNote && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 w-full max-w-3xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden border border-white/10"
                        >
                            {/* Toolbar */}
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-900 z-10">
                                <button onClick={closeEditor} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-slate-200">
                                    <X size={24} />
                                </button>

                                <div className="flex items-center gap-3">
                                    {/* Link Action (Mock) */}
                                    <button title="Link to Task" className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                                        <Link2 size={20} />
                                    </button>
                                    <button title="Delete" onClick={() => deleteNote(selectedNote.id || 'new')} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleSave(true)}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-slate-900">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Title of thought..."
                                    className="w-full text-4xl lg:text-5xl font-black text-slate-100 placeholder:text-slate-700 border-none outline-none bg-transparent mb-8 tracking-tight"
                                />

                                {isReflection && (
                                    <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-sm font-medium flex items-center gap-2">
                                        <Sparkles size={16} />
                                        <span>This is a reflection. Be honest with yourself.</span>
                                    </div>
                                )}

                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Start writing..."
                                    className="w-full h-full resize-none text-lg lg:text-xl text-slate-300 leading-relaxed placeholder:text-slate-700 border-none outline-none bg-transparent min-h-[400px]"
                                />

                                {/* Linked Evolution Indicator */}
                                {selectedNote.id !== 'new' && (
                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
                                            <Target size={14} /> Connected Actions
                                        </h4>
                                        <div className="flex gap-2">
                                            <div className="text-xs font-medium text-slate-500 italic">
                                                No linked specific tasks yet. (Link button pending)
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
