export interface CalendarDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function buildMonthGrid(year: number, monthIndex: number): CalendarDay[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startWeekday);

  const todayIso = new Date().toISOString().slice(0, 10);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    days.push({
      date,
      iso,
      inCurrentMonth: date.getMonth() === monthIndex,
      isToday: iso === todayIso,
    });
  }

  return days;
}

export const weekdayLabels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export const monthLabels = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
