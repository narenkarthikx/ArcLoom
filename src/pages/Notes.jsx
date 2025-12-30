import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, StickyNote, X } from 'lucide-react';
import { api } from '../lib/api';
import { format } from 'date-fns';

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await api.notes.list();
            setNotes(data);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;

        try {
            if (selectedNote) {
                // Update
                const updated = await api.notes.update(selectedNote.id, { title, content });
                setNotes(notes.map(n => n.id === updated.id ? updated : n));
            } else {
                // Create
                const created = await api.notes.create({ title: title || 'Untitled Note', content });
                setNotes([created, ...notes]);
            }
            closeEditor();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this note?')) return;
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
        setIsEditing(true);
    };

    const createNewNote = () => {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setIsEditing(true);
    };

    const closeEditor = () => {
        setIsEditing(false);
        setSelectedNote(null);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-6">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 flex flex-col ${isEditing ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
                    <button
                        onClick={createNewNote}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => openNote(note)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${selectedNote?.id === note.id
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-white border-slate-100 hover:border-indigo-100'
                                }`}
                        >
                            <h3 className="font-semibold text-slate-800 truncate">{note.title || 'Untitled'}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                {note.content || 'No preview available'}
                            </p>
                            <p className="text-xs text-slate-400 mt-3">
                                {format(new Date(note.updated_at), 'MMM d, h:mm a')}
                            </p>
                        </div>
                    ))}

                    {notes.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-400">
                            <StickyNote size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No notes yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <AnimatePresence>
                {(isEditing || window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`
                    flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden
                    ${!isEditing && 'hidden md:flex items-center justify-center text-slate-300'}
                    ${isEditing && 'fixed inset-0 z-50 md:static'}
                `}
                    >
                        {isEditing ? (
                            <>
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <button onClick={closeEditor} className="md:hidden p-2 text-slate-500">
                                        <X size={20} />
                                    </button>
                                    <div className="flex gap-2 ml-auto">
                                        {selectedNote && (
                                            <button
                                                onClick={() => handleDelete(selectedNote.id)}
                                                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                        >
                                            Save Note
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Note Title"
                                        className="text-2xl font-bold text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 outline-none w-full bg-transparent mb-4"
                                    />
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Start typing..."
                                        className="flex-1 resize-none text-slate-600 leading-relaxed placeholder:text-slate-300 border-none focus:ring-0 outline-none w-full bg-transparent"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <StickyNote size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Select a note or create a new one</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
