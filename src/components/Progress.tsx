import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar as CalendarIcon,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const DATA = [
  { day: 'Mon', coding: 4.5, tasks: 8, focus: 120 },
  { day: 'Tue', coding: 6.2, tasks: 12, focus: 180 },
  { day: 'Wed', coding: 3.8, tasks: 5, focus: 90 },
  { day: 'Thu', coding: 8.5, tasks: 15, focus: 240 },
  { day: 'Fri', coding: 5.4, tasks: 10, focus: 150 },
  { day: 'Sat', coding: 2.1, tasks: 4, focus: 60 },
  { day: 'Sun', coding: 4.0, tasks: 7, focus: 110 },
];

interface ProgressProps {
  isLocal?: boolean;
  uid?: string;
}

export default function Progress({ isLocal = false, uid }: ProgressProps) {
  const stats = [
    { label: 'Total Coding', value: '34.5h', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Tasks Done', value: '61', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Focus Time', value: '950m', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Productivity', value: '84%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Progress Tracker</h2>
        <p className="text-muted-foreground">Visualize your productivity and track your growth over time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-card border shadow-sm space-y-4"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coding Hours Chart */}
        <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Coding Hours</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase bg-accent px-3 py-1 rounded-full">
              <CalendarIcon className="w-3 h-3" />
              Last 7 Days
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="coding" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCoding)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Completed Chart */}
        <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Tasks Completed</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase bg-accent px-3 py-1 rounded-full">
              <Target className="w-3 h-3" />
              Efficiency
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                  {DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 3 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto md:mx-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">You're on a roll!</h3>
            <p className="text-brand-100">You've completed 15% more tasks this week compared to last week.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-brand-700 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg">
          Share Progress
        </button>
      </div>
    </div>
  );
}
