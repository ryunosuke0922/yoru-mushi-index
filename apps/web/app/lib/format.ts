const dateKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  weekday: "short",
});

export function todayKey() {
  return dateKeyFormatter.format(new Date());
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00+09:00`);
  date.setDate(date.getDate() + days);

  return dateKeyFormatter.format(date);
}

export function daysBetween(startDateKey: string, dateKey: string) {
  const startDate = new Date(`${startDateKey}T00:00:00+09:00`);
  const date = new Date(`${dateKey}T00:00:00+09:00`);

  return Math.round((date.getTime() - startDate.getTime()) / 86_400_000);
}

export function formatHour(time: string) {
  return time.slice(11, 16);
}

export function formatNightDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00+09:00`);
  const weekday = weekdayFormatter.format(date);

  return `${Number(dateKey.slice(5, 7))}/${Number(dateKey.slice(8, 10))}（${weekday}）夜`;
}

export function formatJstMinute(isoTime: string) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(new Date(isoTime));
}

export function nightLabel(dateKey: string, baseDateKey: string) {
  const offset = daysBetween(baseDateKey, dateKey);

  if (offset === 0) {
    return "今夜";
  }

  if (offset === 1) {
    return "明日夜";
  }

  return formatNightDate(dateKey);
}

export function moonPhaseName(phase: number) {
  if (phase < 0.03 || phase >= 0.97) {
    return "新月";
  }

  if (phase < 0.22) {
    return "三日月";
  }

  if (phase < 0.28) {
    return "上弦";
  }

  if (phase < 0.47) {
    return "十三夜";
  }

  if (phase < 0.53) {
    return "満月";
  }

  if (phase < 0.72) {
    return "寝待月";
  }

  if (phase < 0.78) {
    return "下弦";
  }

  return "有明月";
}
