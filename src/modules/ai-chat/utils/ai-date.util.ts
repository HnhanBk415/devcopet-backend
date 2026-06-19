export function getVietnamDateKey() {
  const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return vietnamTime.toISOString().slice(0, 10);
}

export function getVietnamResetAtIso() {
  const [year, month, day] = getVietnamDateKey().split('-').map(Number);
  const nextDayUtc = Date.UTC(year, month - 1, day + 1, -7, 0, 0);
  return new Date(nextDayUtc).toISOString();
}
