const dateKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayKey() {
  return dateKeyFormatter.format(new Date());
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00+09:00`);
  date.setDate(date.getDate() + days);

  return dateKeyFormatter.format(date);
}

export function formatHour(time: string) {
  return time.slice(11, 16);
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
