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
  VolumeX,
  X,
  History
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
  const [showHistory, setShowHistory] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [tempFocus, setTempFocus] = useState(state.focusDuration / 60);
  const [tempBreak, setTempBreak] = useState(state.breakDuration / 60);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    setTempFocus(state.focusDuration / 60);
    setTempBreak(state.breakDuration / 60);
  }, [state.focusDuration, state.breakDuration]);

  useEffect(() => {
    if (state.timeLeft === 0) {
      setIsRinging(true);
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
    oscillatorRef.current = osc;

    // Alarm for 30 seconds as requested
    setTimeout(() => {
      stopAlarm();
    }, 30000);
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      } catch (e) {
        // Already stopped
      }
    }
    setIsRinging(false);
  };

  const toggleTimer = () => {
    initAudio();
    if (isRinging) stopAlarm();
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    stopAlarm();
    setState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: prev.mode === 'focus' ? prev.focusDuration : prev.breakDuration
    }));
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    stopAlarm();
    setState(prev => ({
      ...prev,
      isActive: false,
      mode: newMode,
      timeLeft: newMode === 'focus' ? prev.focusDuration : prev.breakDuration
    }));
  };

  const saveSettings = () => {
    const newFocus = Math.max(1, Math.min(60, tempFocus)) * 60;
    const newBreak = Math.max(1, Math.min(60, tempBreak)) * 60;
    
    setState(prev => ({
      ...prev,
      focusDuration: newFocus,
      breakDuration: newBreak,
      timeLeft: prev.mode === 'focus' ? newFocus : newBreak,
      isActive: false
    }));
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.mode === 'focus' 
    ? (state.timeLeft / state.focusDuration) * 100 
    : (state.timeLeft / state.breakDuration) * 100;

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
          <AnimatePresence mode="wait">
            {isRinging ? (
              <motion.div
                key="ringing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center animate-bounce">
                  <Bell className="w-8 h-8" />
                </div>
                <button
                  onClick={stopAlarm}
                  className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg"
                >
                  Stop Alarm
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key={state.timeLeft}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl md:text-8xl font-bold font-mono tracking-tighter"
              >
                {formatTime(state.timeLeft)}
              </motion.div>
            )}
          </AnimatePresence>
          {!isRinging && (
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {state.mode === 'focus' ? 'Time to focus' : 'Break time'}
            </p>
          )}
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <History className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl space-y-8 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Session History</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-accent rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {state.rounds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No sessions completed yet.</p>
                  </div>
                ) : (
                  state.rounds.slice().reverse().map((round) => (
                    <div key={round.id} className="flex items-center justify-between p-4 rounded-2xl bg-accent/50 border">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          round.type === 'focus' ? "bg-primary/10 text-primary" : "bg-brand-500/10 text-brand-500"
                        )}>
                          {round.type === 'focus' ? <Brain className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold capitalize">{round.type} Session</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(round.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm">{Math.round(round.duration / 60)}m</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-card border rounded-3xl p-8 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Timer Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-accent rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Focus Duration (min)</label>
                  <input 
                    type="number" 
                    value={tempFocus}
                    onChange={(e) => setTempFocus(parseInt(e.target.value) || 0)}
                    className="w-full bg-accent border-none rounded-2xl px-4 py-3 text-lg font-bold focus:ring-2 ring-primary transition-all"
                    min="1"
                    max="60"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Break Duration (min)</label>
                  <input 
                    type="number" 
                    value={tempBreak}
                    onChange={(e) => setTempBreak(parseInt(e.target.value) || 0)}
                    className="w-full bg-accent border-none rounded-2xl px-4 py-3 text-lg font-bold focus:ring-2 ring-primary transition-all"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
