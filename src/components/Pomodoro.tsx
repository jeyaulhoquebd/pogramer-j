import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Bell,
  Settings as SettingsIcon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PomodoroState } from '../App';

interface PomodoroProps {
  state: PomodoroState;
  setState: React.Dispatch<React.SetStateAction<PomodoroState>>;
}

export default function Pomodoro({ state, setState }: PomodoroProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  useEffect(() => {
    if (state.timeLeft === 0) {
      if (!isMuted) {
        playAlarm();
      }
    }
  }, [state.timeLeft]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playAlarm = () => {
    initAudio();
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    // Alarm for 30 seconds as requested
    setTimeout(() => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    }, 30000);
  };

  const toggleTimer = () => {
    initAudio();
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: prev.mode === 'focus' ? FOCUS_TIME : BREAK_TIME
    }));
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setState({
      isActive: false,
      mode: newMode,
      timeLeft: newMode === 'focus' ? FOCUS_TIME : BREAK_TIME
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.mode === 'focus' 
    ? (state.timeLeft / FOCUS_TIME) * 100 
    : (state.timeLeft / BREAK_TIME) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center space-y-12 py-10">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h2>
        <p className="text-muted-foreground">Focus on your work, then take a well-deserved break.</p>
      </header>

      <div className="flex bg-card border rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => switchMode('focus')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
            state.mode === 'focus' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain className="w-4 h-4" />
          Focus
        </button>
        <button
          onClick={() => switchMode('break')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
            state.mode === 'break' ? "bg-brand-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="w-4 h-4" />
          Break
        </button>
      </div>

      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-accent"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: (1 - progress / 100) * 301.59 }}
            transition={{ duration: 1, ease: "linear" }}
            className={cn(
              "transition-colors duration-500",
              state.mode === 'focus' ? "text-primary" : "text-brand-500"
            )}
            style={{ 
              strokeDasharray: "301.59", 
              strokeLinecap: 'round' 
            }}
          />
        </svg>

        <div className="text-center space-y-2 relative z-10">
          <motion.div 
            key={state.timeLeft}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl md:text-8xl font-bold font-mono tracking-tighter"
          >
            {formatTime(state.timeLeft)}
          </motion.div>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {state.mode === 'focus' ? 'Time to focus' : 'Break time'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-card border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95",
            state.isActive 
              ? "bg-accent text-foreground" 
              : "bg-primary text-primary-foreground shadow-primary/30"
          )}
        >
          {state.isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
        </button>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 rounded-2xl bg-card border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      <div className="w-full max-w-md p-6 rounded-3xl bg-card border shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            state.isActive ? "bg-primary/10 text-primary animate-pulse" : "bg-accent text-muted-foreground"
          )}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Notifications</p>
            <p className="text-xs text-muted-foreground">Alarm will sound for 30s</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <SettingsIcon className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
