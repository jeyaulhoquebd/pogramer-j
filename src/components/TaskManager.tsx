import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Tag, 
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task, Category } from '../types';
import { cn } from '../lib/utils';

export default function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Personal');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const categories: Category[] = ['Study', 'Coding', 'Personal'];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Task Manager</h2>
        <p className="text-muted-foreground">Keep track of your daily goals and stay organized.</p>
      </header>

      <form onSubmit={addTask} className="relative group">
        <div className="absolute inset-x-0 -bottom-2 h-full bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex flex-col md:flex-row gap-3 p-2 bg-card border rounded-2xl shadow-sm">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-lg"
          />
          <div className="flex items-center gap-2 px-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="bg-accent/50 border-none rounded-xl text-sm font-medium focus:ring-0 py-2"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              type="submit"
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <div className="flex bg-card border rounded-xl p-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all",
                filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            {tasks.filter(t => !t.completed).length} items left
          </p>
          {tasks.some(t => t.completed) && (
            <button 
              onClick={() => setTasks(tasks.filter(t => !t.completed))}
              className="text-xs font-bold text-destructive hover:underline uppercase tracking-widest"
            >
              Clear Completed
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl bg-card border transition-all hover:shadow-md",
                task.completed && "opacity-60"
              )}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className="text-primary transition-transform hover:scale-110"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 fill-primary text-primary-foreground" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate transition-all",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    task.category === 'Coding' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                    task.category === 'Study' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  )}>
                    {task.category}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-xl">All caught up!</p>
              <p className="text-muted-foreground">No tasks found for this filter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
