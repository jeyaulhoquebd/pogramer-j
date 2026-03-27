import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Clock, 
  Save,
  Maximize2,
  Minimize2,
  ChevronRight,
  StickyNote,
  Type,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Note } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsPreview(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setIsSaving(true);
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
    
    // Simulate a brief saving state
    setTimeout(() => setIsSaving(false), 500);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="h-[calc(100dvh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 md:gap-6 relative">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 flex flex-col gap-4 transition-all duration-300",
        activeNoteId ? "hidden md:flex" : "flex"
      )}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Notes</h2>
          <button 
            onClick={createNote}
            className="p-2 bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveNoteId(note.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveNoteId(note.id);
                }
              }}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20",
                activeNoteId === note.id 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "bg-card hover:bg-accent/50"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className={cn(
                  "font-bold truncate pr-6",
                  activeNoteId === note.id ? "text-primary" : ""
                )}>
                  {note.title || 'Untitled Note'}
                </h4>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note.id);
                  }}
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all absolute top-2 right-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {note.content || 'No content yet...'}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                {format(note.updatedAt, 'MMM d, HH:mm')}
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">No notes found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className={cn(
        "flex-1 bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all duration-300",
        !activeNoteId ? "hidden md:flex" : "flex"
      )}>
        {activeNote ? (
          <>
            <div className="p-3 md:p-4 border-b flex items-center justify-between bg-accent/30 gap-2">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <button 
                  onClick={() => setActiveNoteId(null)}
                  className="md:hidden p-2 hover:bg-accent rounded-xl transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  className="w-full bg-transparent border-none focus:ring-0 font-bold text-base md:text-xl truncate"
                  placeholder="Note Title"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <Save className="w-3 h-3 animate-pulse" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      Saved
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-sm font-bold transition-all",
                    isPreview ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                  )}
                >
                  {isPreview ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {isPreview ? (
                <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-pre:bg-accent prose-pre:text-foreground">
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Start writing in markdown..."
                  className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                />
              )}
            </div>
            <div className="p-3 border-t bg-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  {getWordCount(activeNote.content)} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last updated: {format(activeNote.updatedAt, 'HH:mm')}
                </span>
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Markdown Supported
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6">
            <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center">
              <StickyNote className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Select a note to view</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                Choose a note from the sidebar or create a new one to start writing.
              </p>
            </div>
            <button 
              onClick={createNote}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" />
              Create New Note
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {noteToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold">Delete Note?</h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this note? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setNoteToDelete(null)}
                  className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-2xl font-bold hover:bg-accent/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-2xl font-bold hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
