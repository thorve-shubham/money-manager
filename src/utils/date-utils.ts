export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function formatDate(timestamp: number, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(timestamp);
  if (format === 'short') {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getMonthYear(timestamp: number): { month: number; year: number } {
  const date = new Date(timestamp);
  return { month: date.getMonth(), year: date.getFullYear() };
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function daysUntil(timestamp: number): number {
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isSameDay(a: number, b: number): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function toYYYYMM(date: Date): number {
  return date.getFullYear() * 100 + (date.getMonth() + 1);
}
