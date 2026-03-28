import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  StickyNote, 
  BarChart3, 
  Moon, 
  Sun,
  Menu,
  X,
  Heart,
  ShieldAlert,
  Loader2,
  LogOut,
  Globe,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import Pomodoro from './components/Pomodoro';
import Notes from './components/Notes';
import Progress from './components/Progress';
import RecoveryTracker from './components/RecoveryTracker';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import ErrorBoundary from './components/ErrorBoundary';
import LoginScreen from './components/LoginScreen';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { UserProfile } from './types';

type Page = 'dashboard' | 'tasks' | 'pomodoro' | 'notes' | 'progress' | 'recovery';

export interface PomodoroRound {
  id: string;
  type: 'focus' | 'break';
  duration: number;
  completedAt: string;
}

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  focusDuration: number;
  breakDuration: number;
  rounds: PomodoroRound[];
}

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only clear profile if the user was NOT in local mode
      if (!user) {
        setProfile(prev => {
          if (prev?.isLocal) return prev;
          return null;
        });
      } else {
        // If we have a user, ensure profile is set for online mode if not already
        setProfile(prev => {
          if (prev) return prev;
          return {
            uid: user.uid,
            name: user.displayName || 'User',
            country: 'Bangladesh',
            city: 'Dhaka',
            isLocal: false
          };
        });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [setProfile]);

  // Pomodoro Global State with Firestore Sync
  const [pomodoro, setPomodoro] = useFirestoreSync<PomodoroState>('pomodoro', {
    timeLeft: 25 * 60,
    isActive: false,
    mode: 'focus',
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    rounds: []
  }, profile?.isLocal, profile?.uid);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoro.isActive && pomodoro.timeLeft > 0) {
      timer = setInterval(() => {
        setPomodoro(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.timeLeft === 0) {
      const completedRound: PomodoroRound = {
        id: crypto.randomUUID(),
        type: pomodoro.mode,
        duration: pomodoro.mode === 'focus' ? pomodoro.focusDuration : pomodoro.breakDuration,
        completedAt: new Date().toISOString()
      };

      setPomodoro(prev => ({
        ...prev,
        isActive: false,
        mode: prev.mode === 'focus' ? 'break' : 'focus',
        timeLeft: prev.mode === 'focus' ? prev.breakDuration : prev.focusDuration,
        rounds: [...prev.rounds, completedRound]
      }));
    }
    return () => clearInterval(timer);
  }, [pomodoro.isActive, pomodoro.timeLeft, pomodoro.focusDuration, pomodoro.breakDuration, pomodoro.mode]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <ErrorBoundary>
        <LoginScreen onLogin={setProfile} />
      </ErrorBoundary>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'recovery', label: 'Freedom', icon: ShieldAlert },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return (
        <Dashboard 
          onNavigate={setActivePage} 
          pomodoro={pomodoro} 
          isLocal={profile.isLocal}
          uid={profile.uid}
        />
      );
      case 'tasks': return <TaskManager isLocal={profile.isLocal} uid={profile.uid} />;
      case 'pomodoro': return <Pomodoro state={pomodoro} setState={setPomodoro} />;
      case 'notes': return <Notes isLocal={profile.isLocal} uid={profile.uid} />;
      case 'progress': return <Progress isLocal={profile.isLocal} uid={profile.uid} />;
      case 'recovery': return <RecoveryTracker isLocal={profile.isLocal} uid={profile.uid} />;
      default: return (
        <Dashboard 
          onNavigate={setActivePage} 
          pomodoro={pomodoro} 
        />
      );
    }
  };

  const UserInfo = () => (
    <div className="px-4 py-3 rounded-xl bg-accent/50 border mb-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ব্যবহারকারী</p>
        {profile.isLocal && (
          <span className="text-[8px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
            Offline Mode
          </span>
        )}
      </div>
      <p className="font-bold truncate">{profile.name}</p>
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span className="truncate">{profile.country}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{profile.city}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
            <img src="https://pbs.twimg.com/media/HEbd_28b0AEJvJD?format=jpg&name=small" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Pogramer</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                activePage === item.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", activePage === item.id ? "" : "group-hover:scale-110 transition-transform")} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.id === 'pomodoro' && pomodoro.isActive && (
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <UserInfo />
          
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button 
            onClick={() => {
              signOut(auth);
              setProfile(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
          
          <div className="px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center gap-3 mt-2">
            <Heart className="w-5 h-5 text-brand-500 fill-brand-500" />
            <div className="text-xs">
              <p className="font-semibold text-brand-600 dark:text-brand-400">Daily Reminder</p>
              <p className="text-muted-foreground">Stay disciplined, stay focused.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="https://pbs.twimg.com/media/HEbd_28b0AEJvJD?format=jpg&name=small" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-lg">Pogramer</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-accent rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-card z-[70] md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img src="https://pbs.twimg.com/media/HEbd_28b0AEJvJD?format=jpg&name=small" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h1 className="font-bold text-xl">Pogramer</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-accent rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id as Page);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activePage === item.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t space-y-2">
                <UserInfo />
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button 
                  onClick={() => {
                    signOut(auth);
                    setProfile(null);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
