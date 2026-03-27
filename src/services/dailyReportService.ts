import { PomodoroState, PomodoroRound } from '../App';
import { Task, Note } from '../types';
import { format, isSameDay, subDays } from 'date-fns';
import { sendTelegramMessage } from './telegramService';

export function getDailyData(date: Date) {
  // Read from localStorage directly
  const pomodoroStr = localStorage.getItem('pomodoro');
  const tasksStr = localStorage.getItem('tasks');
  const notesStr = localStorage.getItem('notes');
  const prayersStr = localStorage.getItem('completedPrayers');

  const pomodoro: PomodoroState | null = pomodoroStr ? JSON.parse(pomodoroStr) : null;
  const tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];
  const notes: Note[] = notesStr ? JSON.parse(notesStr) : [];
  const prayers: Record<string, string[]> = prayersStr ? JSON.parse(prayersStr) : {};

  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Filter data for the specific day
  const roundsToday = pomodoro?.rounds.filter(r => isSameDay(new Date(r.completedAt), date)) || [];
  const tasksCompletedToday = tasks.filter(t => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), date));
  const notesUpdatedToday = notes.filter(n => isSameDay(new Date(n.updatedAt), date));
  const prayersToday = prayers[dateStr] || [];

  return {
    date,
    rounds: roundsToday,
    tasks: tasksCompletedToday,
    notes: notesUpdatedToday,
    prayers: prayersToday,
  };
}

export function formatDailyReport(data: ReturnType<typeof getDailyData>) {
  const dateFormatted = format(data.date, 'EEEE, MMMM do, yyyy');
  
  let message = `*Daily Work Report - ${dateFormatted}*\n\n`;

  // Pomodoro
  const focusRounds = data.rounds.filter(r => r.type === 'focus');
  const breakRounds = data.rounds.filter(r => r.type === 'break');
  const totalFocusMinutes = focusRounds.reduce((acc, r) => acc + (r.duration / 60), 0);
  
  message += `*🍅 Pomodoro Timer*\n`;
  message += `- Focus Rounds: ${focusRounds.length}\n`;
  message += `- Break Rounds: ${breakRounds.length}\n`;
  message += `- Total Focus Time: ${Math.round(totalFocusMinutes)} mins\n\n`;

  // Tasks
  message += `*✅ Tasks Completed (${data.tasks.length})*\n`;
  if (data.tasks.length > 0) {
    data.tasks.forEach(t => {
      message += `- [${t.category}] ${t.title}\n`;
    });
  } else {
    message += `- No tasks completed today.\n`;
  }
  message += `\n`;

  // Prayers
  message += `*🕌 Prayers Tracker*\n`;
  if (data.prayers.length > 0) {
    message += `- Completed: ${data.prayers.join(', ')}\n`;
  } else {
    message += `- No prayers tracked today.\n`;
  }
  message += `\n`;

  // Notes
  message += `*📝 Notes Updated (${data.notes.length})*\n`;
  if (data.notes.length > 0) {
    data.notes.forEach(n => {
      message += `- ${n.title}\n`;
    });
  } else {
    message += `- No notes updated today.\n`;
  }

  return message;
}

export async function sendDailyReport(date: Date = subDays(new Date(), 1)) {
  const data = getDailyData(date);
  const message = formatDailyReport(data);
  return await sendTelegramMessage(message);
}
