import { state } from "./state.js";
import { getEntriesByMonth } from "./entries.js";
import { formatDisplayDate, getMonthKey } from "./utils.js";

function normalizeTextList(value = "") {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function addItemsToCountMap(items, map) {
  items.forEach((item) => {
    const key = item.toLowerCase();
    map.set(key, (map.get(key) || 0) + 1);
  });
}

function getTopItems(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count
    }));
}

function formatMonthLabelFromDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

function getDaysInMonthFromDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

function getSafeEntryStatus(entry) {
  return entry.status || "Not Started";
}

function getProfessional(entry) {
  return entry.professional || {};
}

function getPersonal(entry) {
  return entry.personal || {};
}

function getReflection(entry) {
  return entry.reflection || {};
}

export function getMonthlyStats(dateString) {
  const monthlyEntries = getEntriesByMonth(dateString);

  const completedCount = monthlyEntries.filter(
    (entry) => getSafeEntryStatus(entry) === "Completed"
  ).length;

  const inProgressCount = monthlyEntries.filter(
    (entry) => getSafeEntryStatus(entry) === "In Progress"
  ).length;

  const daysInMonth = getDaysInMonthFromDate(dateString);

  return {
    totalEntries: monthlyEntries.length,
    completedCount,
    inProgressCount,
    notStartedCount: Math.max(0, daysInMonth - monthlyEntries.length)
  };
}

export function getLatestReportLabel() {
  if (!state.reports.length) {
    return "No report generated";
  }

  const latestReport = state.reports[state.reports.length - 1];
  return latestReport.period?.label || `${latestReport.type || "Monthly"} report ready`;
}

export function buildMonthlyReportSnapshot(dateString) {
  const stats = getMonthlyStats(dateString);

  return {
    title: "Monthly Snapshot",
    totalEntries: stats.totalEntries,
    completedEntries: stats.completedCount,
    inProgressEntries: stats.inProgressCount,
    summary:
      stats.totalEntries === 0
        ? "No entries logged this month yet."
        : `You logged ${stats.totalEntries} entries this month, with ${stats.completedCount} completed days.`
  };
}

export function generateMonthlyReport(dateString) {
  const monthlyEntries = getEntriesByMonth(dateString);
  const monthKey = getMonthKey(dateString);
  const daysInMonth = getDaysInMonthFromDate(dateString);

  let completedCount = 0;
  let inProgressCount = 0;
  let totalProfessionalHours = 0;

  const blockerMap = new Map();
  const winMap = new Map();
  const professionalMoodMap = new Map();
  const personalMoodMap = new Map();

  const learningHighlights = [];
  const reflectionHighlights = [];
  const gratitudeHighlights = [];

  monthlyEntries.forEach((entry) => {
    const status = getSafeEntryStatus(entry);

    if (status === "Completed") completedCount += 1;
    if (status === "In Progress") inProgressCount += 1;

    const professional = getProfessional(entry);
    const personal = getPersonal(entry);
    const reflection = getReflection(entry);

    totalProfessionalHours += Number(professional.hours || 0);

    addItemsToCountMap(normalizeTextList(professional.wins || ""), winMap);
    addItemsToCountMap(normalizeTextList(personal.wins || ""), winMap);

    addItemsToCountMap(normalizeTextList(professional.blockers || ""), blockerMap);
    addItemsToCountMap(normalizeTextList(personal.blockers || ""), blockerMap);

    if (String(professional.mood || "").trim()) {
      addItemsToCountMap([professional.mood.trim()], professionalMoodMap);
    }

    if (String(personal.mood || "").trim()) {
      addItemsToCountMap([personal.mood.trim()], personalMoodMap);
    }

    if (String(reflection.biggestLearning || "").trim()) {
      learningHighlights.push({
        date: entry.date,
        displayDate: formatDisplayDate(entry.date),
        text: reflection.biggestLearning.trim()
      });
    }

    if (String(reflection.improvements || "").trim()) {
      reflectionHighlights.push({
        date: entry.date,
        displayDate: formatDisplayDate(entry.date),
        text: reflection.improvements.trim()
      });
    }

    if (String(reflection.gratitude || "").trim()) {
      gratitudeHighlights.push({
        date: entry.date,
        displayDate: formatDisplayDate(entry.date),
        text: reflection.gratitude.trim()
      });
    }
  });

  return {
    id: `report-${monthKey}`,
    type: "Monthly",
    monthKey,
    period: {
      label: formatMonthLabelFromDate(dateString),
      daysInMonth
    },
    totals: {
      entries: monthlyEntries.length,
      completed: completedCount,
      inProgress: inProgressCount,
      emptyDays: Math.max(daysInMonth - monthlyEntries.length, 0),
      professionalHours: Number(totalProfessionalHours.toFixed(1))
    },
    patterns: {
      topWins: getTopItems(winMap, 5),
      topBlockers: getTopItems(blockerMap, 5),
      professionalMoods: getTopItems(professionalMoodMap, 5),
      personalMoods: getTopItems(personalMoodMap, 5)
    },
    highlights: {
      learnings: learningHighlights.slice(-3).reverse(),
      reflections: reflectionHighlights.slice(-3).reverse(),
      gratitude: gratitudeHighlights.slice(-3).reverse()
    },
    meta: {
      generatedAt: new Date().toISOString(),
      sourceEntryCount: monthlyEntries.length,
      readyForLLM: true
    }
  };
}
