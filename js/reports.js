import { state } from "./state.js";
import { getEntriesByMonth } from "./entries.js";

export function getMonthlyStats(dateString) {
  const monthlyEntries = getEntriesByMonth(dateString);

  const completedCount = monthlyEntries.filter(
    (entry) => entry.status === "Completed"
  ).length;

  const inProgressCount = monthlyEntries.filter(
    (entry) => entry.status === "In Progress"
  ).length;

  return {
    totalEntries: monthlyEntries.length,
    completedCount,
    inProgressCount,
    notStartedCount: Math.max(0, monthlyEntries.length - completedCount - inProgressCount)
  };
}

export function getLatestReportLabel() {
  if (!state.reports.length) {
    return "No report generated";
  }

  const latestReport = state.reports[state.reports.length - 1];
  return `${latestReport.type} report ready`;
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
