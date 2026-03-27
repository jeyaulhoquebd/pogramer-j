import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Quote, 
  Code, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Timer,
  Settings,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, parse } from 'date-fns';
import { cn } from '../lib/utils';
import { PomodoroState } from '../App';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DashboardProps {
  onNavigate: (page: any) => void;
  pomodoro: PomodoroState;
}

const DEFAULT_PRAYER_TIMES = [
  { name: 'Fajr', time: '05:12' },
  { name: 'Dhuhr', time: '12:34' },
  { name: 'Asr', time: '15:56' },
  { name: 'Maghrib', time: '18:45' },
  { name: 'Isha', time: '20:01' },
];

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your code is your legacy. Write it with purpose.", author: "Unknown" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
];

export default function Dashboard({ onNavigate, pomodoro }: DashboardProps) {
  const [time, setTime] = useState(new Date());
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [codingHours, setCodingHours] = useState(4.5); // Mock data
  const [prayerTimes, setPrayerTimes] = useLocalStorage('prayerTimes', DEFAULT_PRAYER_TIMES);
  const [completedPrayers, setCompletedPrayers] = useLocalStorage<Record<string, string[]>>('completedPrayers', {});
  const [isEditingPrayers, setIsEditingPrayers] = useState(false);
  const [tempPrayers, setTempPrayers] = useState(prayerTimes);
  const codingGoal = 8;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getNextPrayer = () => {
    const now = format(time, 'HH:mm');
    return prayerTimes.find((p: any) => p.time > now) || prayerTimes[0];
  };

  const nextPrayer = getNextPrayer();

  const handleSavePrayers = () => {
    setPrayerTimes(tempPrayers);
    setIsEditingPrayers(false);
  };

  const togglePrayer = (prayerName: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentDayPrayers = completedPrayers[today] || [];
    
    let newDayPrayers;
    if (currentDayPrayers.includes(prayerName)) {
      newDayPrayers = currentDayPrayers.filter(p => p !== prayerName);
    } else {
      newDayPrayers = [...currentDayPrayers, prayerName];
    }

    setCompletedPrayers({
      ...completedPrayers,
      [today]: newDayPrayers
    });
  };

  const isPrayerCompleted = (prayerName: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return (completedPrayers[today] || []).includes(prayerName);
  };

  const formatPomodoroTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Salam, Programmer</h2>
          <p className="text-muted-foreground mt-1">Stay disciplined, stay focused.</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">{format(time, 'EEEE, MMMM do')}</p>
            <p className="text-2xl font-bold font-mono uppercase">{format(time, 'hh:mm:ss a')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group"
        >
          <Quote className="absolute -top-4 -right-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <p className="text-2xl font-medium leading-relaxed italic">"{quote.text}"</p>
            <p className="text-brand-100 font-medium">— {quote.author}</p>
          </div>
        </motion.div>

        {/* Pomodoro Status Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('pomodoro')}
          className={cn(
            "p-8 rounded-3xl border shadow-sm flex flex-col justify-between cursor-pointer transition-colors",
            pomodoro.isActive ? "bg-primary/5 border-primary/30" : "bg-card"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              pomodoro.isActive ? "bg-primary text-primary-foreground animate-pulse" : "bg-accent text-muted-foreground"
            )}>
              <Timer className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {pomodoro.mode === 'focus' ? 'Focus Session' : 'Break Time'}
            </span>
          </div>
          <div>
            <p className="text-4xl font-bold font-mono mb-1">{formatPomodoroTime(pomodoro.timeLeft)}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pomodoro.isActive ? 'Session in progress...' : 'Ready to start?'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                <span>{pomodoro.rounds.filter(r => r.type === 'focus' && new Date(r.completedAt).toDateString() === new Date().toDateString()).length}</span>
                <span className="text-[10px] uppercase opacity-60">Rounds</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Prayer Times Widget */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-card border shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold">Prayer Times</h3>
            </div>
            <button 
              onClick={() => {
                setTempPrayers(prayerTimes);
                setIsEditingPrayers(true);
              }}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {prayerTimes.map((p: any) => {
              const completed = isPrayerCompleted(p.name);
              const isNext = p.name === nextPrayer.name;
              
              return (
                <div 
                  key={p.name} 
                  onClick={() => togglePrayer(p.name)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group",
                    isNext ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50 border border-transparent",
                    completed && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                      completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 group-hover:border-primary/50"
                    )}>
                      {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={cn(
                      "font-medium transition-colors", 
                      isNext ? "text-primary" : "text-muted-foreground",
                      completed && "line-through"
                    )}>
                      {p.name}
                    </span>
                  </div>
                  <span className={cn("font-mono font-bold uppercase", isNext ? "text-primary" : "text-muted-foreground/70")}>
                    {format(parse(p.time, 'HH:mm', new Date()), 'h:mm a')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prayer Times Editor Modal */}
        <AnimatePresence>
          {isEditingPrayers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Set Prayer Times</h3>
                  <button onClick={() => setIsEditingPrayers(false)} className="p-2 hover:bg-accent rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tempPrayers.map((p: any, index: number) => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                      <label className="font-bold text-sm text-muted-foreground uppercase tracking-widest w-20">{p.name}</label>
                      <input
                        type="time"
                        value={p.time}
                        onChange={(e) => {
                          const newPrayers = [...tempPrayers];
                          newPrayers[index] = { ...p, time: e.target.value };
                          setTempPrayers(newPrayers);
                        }}
                        className="flex-1 bg-accent/50 border-none rounded-xl px-4 py-2 font-mono font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditingPrayers(false)}
                      className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-2xl font-bold hover:bg-accent/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePrayers}
                      className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Times
                    </button>
                  </div>
                  <button
                    onClick={() => setTempPrayers(DEFAULT_PRAYER_TIMES)}
                    className="w-full px-6 py-3 bg-accent/50 text-muted-foreground rounded-2xl font-bold hover:bg-accent/80 transition-colors text-sm"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coding Progress & Weekly Activity */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-card border shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Coding Progress</h3>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Code className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{codingHours}h</span>
                <span className="text-muted-foreground text-sm">Goal: {codingGoal}h</span>
              </div>
              <div className="h-2.5 w-full bg-accent rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(codingHours / codingGoal) * 100}%` }}
                  className="h-full bg-orange-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm flex flex-col gap-4">
            <h3 className="font-bold">Weekly Activity</h3>
            <div className="flex-1 flex items-end justify-between gap-2 pt-4">
              {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={cn(
                      "w-full rounded-t-lg transition-colors",
                      i === 3 ? "bg-primary" : "bg-primary/20"
                    )}
                  />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
