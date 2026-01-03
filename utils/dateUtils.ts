
export const BASE_DATE = new Date(2026, 0, 5); // 05/01/2026 é uma Segunda-feira

export const getTodayStr = (): string => {
  // Garante o formato YYYY-MM-DD no fuso de Brasília
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
  return targetDate;
};

export const getMealDateString = (week: number, dayIdx: number): string => {
  const date = getMealDate(week, dayIdx);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getCurrentWeekAndDay = () => {
  const now = new Date();
  const diffTime = now.getTime() - BASE_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { week: 1, day: 0 };
  
  const week = Math.floor(diffDays / 7) + 1;
  const day = diffDays % 7;
  
  return { 
    week, 
    day: day > 4 ? 4 : day 
  };
};

export const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};
