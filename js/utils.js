export function getTodayParts() {
  const now = new Date();

  return {
    date: now.toISOString().split("T")[0],
    dayName: now.toLocaleDateString("en-US", { weekday: "long" }),
    monthName: now.toLocaleDateString("en-US", { month: "long" }),
    year: now.getFullYear().toString()
  };
}

export function formatDisplayDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function truncateText(text = "", maxLength = 80) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function getMonthKey(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
