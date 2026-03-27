import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  History, 
  AlertCircle, 
  Flame, 
  Calendar, 
  RefreshCw,
  X,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RecoveryState, RelapseRecord } from '../types';
import { cn } from '../lib/utils';

export default function RecoveryTracker() {
  const [recovery, setRecovery] = useLocalStorage<RecoveryState>('recovery', {
    startDate: null,
    relapseHistory: []
  });

  const [isRelapseModalOpen, setIsRelapseModalOpen] = useState(false);
  const [relapseReason, setRelapseReason] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    setRecovery({
      ...recovery,
      startDate: Date.now()
    });
  };

  const handleRelapse = () => {
    if (!relapseReason.trim()) return;

    const newRelapse: RelapseRecord = {
      date: Date.now(),
      reason: relapseReason
    };

    setRecovery({
      startDate: null,
      relapseHistory: [newRelapse, ...recovery.relapseHistory]
    });

    setRelapseReason('');
    setIsRelapseModalOpen(false);
  };

  const getStreakData = () => {
    if (!recovery.startDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = currentTime.getTime() - recovery.startDate;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  const streak = getStreakData();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Freedom Path</h2>
        <p className="text-muted-foreground mt-1">Your journey to a cleaner, more focused life.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Tracker Card */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <div>
                {recovery.startDate ? (
                  <>
                    <p className="text-indigo-100 font-medium uppercase tracking-widest text-sm mb-4">Current Clean Streak</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter">{streak.days}</span>
                        <span className="text-xs uppercase font-bold opacity-60 tracking-widest">Days</span>
                      </div>
                      <span className="text-4xl opacity-30 font-thin">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter">{streak.hours.toString().padStart(2, '0')}</span>
                        <span className="text-xs uppercase font-bold opacity-60 tracking-widest">Hours</span>
                      </div>
                      <span className="text-4xl opacity-30 font-thin">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter">{streak.minutes.toString().padStart(2, '0')}</span>
                        <span className="text-xs uppercase font-bold opacity-60 tracking-widest">Mins</span>
                      </div>
                      <span className="text-4xl opacity-30 font-thin hidden sm:block">:</span>
                      <div className="hidden sm:flex flex-col items-center">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter">{streak.seconds.toString().padStart(2, '0')}</span>
                        <span className="text-xs uppercase font-bold opacity-60 tracking-widest">Secs</span>
                      </div>
                    </div>
                    <p className="text-indigo-100/80 font-mono text-sm">
                      Started {format(recovery.startDate, 'MMM do, yyyy')}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold mb-2">Ready to Start?</h3>
                    <p className="text-indigo-100/80">Take the first step towards freedom today.</p>
                  </>
                )}
              </div>

              {recovery.startDate ? (
                <button
                  onClick={() => setIsRelapseModalOpen(true)}
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset Timer
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Flame className="w-5 h-5" />
                  Start My Journey
                </button>
              )}
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Encouragement Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-card border shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Stay Vigilant</h4>
                <p className="text-sm text-muted-foreground mt-1">Identify your triggers and avoid them early.</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card border shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">One Day at a Time</h4>
                <p className="text-sm text-muted-foreground mt-1">Don't worry about forever. Just focus on today.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Relapse History Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              History
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full text-muted-foreground">
              {recovery.relapseHistory.length} Relapses
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {recovery.relapseHistory.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm">No relapses yet. Keep it up!</p>
              </div>
            ) : (
              recovery.relapseHistory.map((record, index) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={record.date}
                  className="p-4 rounded-2xl bg-card border shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(record.date, 'MMM d, yyyy')}
                    </span>
                    <span>{format(record.date, 'HH:mm')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />
                    <p className="text-sm italic leading-relaxed">"{record.reason}"</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Relapse Modal */}
      <AnimatePresence>
        {isRelapseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRelapseModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Reflect & Reset</h3>
                <button 
                  onClick={() => setIsRelapseModalOpen(false)}
                  className="p-2 hover:bg-accent rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>A relapse is a lesson, not a failure. Be honest with yourself to grow stronger.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold px-1">Why do you want to stop? (What triggered this?)</label>
                  <textarea
                    value={relapseReason}
                    onChange={(e) => setRelapseReason(e.target.value)}
                    placeholder="I felt bored and alone... I want to stop because I want to be more productive and respect myself."
                    className="w-full h-32 p-4 rounded-2xl bg-accent/50 border focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRelapseModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRelapse}
                  disabled={!relapseReason.trim()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  Reset Streak
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
