
export const BASE_DATE = new Date(2026, 0, 5); // 05/01/2026 é uma Segunda-feira

export const getTodayInBrasilia = (): Date => {
  const now = new Date();
  const brasiliaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return brasiliaDate;
};

export const getCurrentWeekNumber = (): number => {
  const now = getTodayInBrasilia();
  // Resetamos as horas para o cálculo ser baseado apenas em dias inteiros
  const start = new Date(BASE_DATE);
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffInMs = now.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Se for antes da data base, retorna semana 1. 
  // Caso contrário, calcula: (dias / 7) + 1
  const weekNum = Math.floor(diffInDays / 7) + 1;
  return Math.max(1, weekNum);
};

export const getTodayStr = (): string => {
  return new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit' 
  }).format(new Date());
};

export const getMealDate = (week: number, dayIdx: number): Date => {
  const targetDate = new Date(BASE_DATE);
  targetDate.setDate(BASE_DATE.getDate() + (week - 1) * 7 + dayIdx);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

export const getMealDateString = (week: number, dayIdx: number): string => {
  const date = getMealDate(week, dayIdx);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Mapeia horários legados para as novas categorias
export const mapTimeToCategory = (time: string): string => {
  const categories = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
  if (categories.includes(time)) return time;

  const hourMatch = time.match(/^(\d{1,2})/);
  if (!hourMatch) return 'Lanche';

  const hour = parseInt(hourMatch[1], 10);
  
  if (hour >= 5 && hour <= 10) return 'Café da Manhã';
  if (hour >= 11 && hour <= 14) return 'Almoço';
  if (hour >= 15 && hour <= 18) return 'Lanche';
  if (hour >= 19 && hour <= 21) return 'Jantar';
  return 'Ceia';
};
