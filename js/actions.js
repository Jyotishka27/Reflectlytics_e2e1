import { state } from "./state.js";
import { getMonthKey, shiftMonthKey } from "./utils.js";
import { generateMonthlyReport } from "./reports.js";
import { renderApp } from "./renderer.js";

export function openReportModal() {
  const fallbackDate = state.today.date || new Date().toISOString().split("T")[0];
  const monthKey = state.ui.activeReportMonth || getMonthKey(fallbackDate);

  state.ui.activeReportMonth = monthKey;
  state.ui.activeReport = generateMonthlyReport(state.entries, monthKey);
  state.ui.isReportModalOpen = true;

  state.dashboard.stats.lastReport = state.ui.activeReport.period.label;

  renderApp();
}

export function closeReportModal() {
  state.ui.isReportModalOpen = false;
  renderApp();
}

export function goToPreviousReportMonth() {
  if (!state.ui.activeReportMonth) return;

  const previousMonth = shiftMonthKey(state.ui.activeReportMonth, -1);
  state.ui.activeReportMonth = previousMonth;
  state.ui.activeReport = generateMonthlyReport(state.entries, previousMonth);

  renderApp();
}

export function goToNextReportMonth() {
  if (!state.ui.activeReportMonth) return;

  const nextMonth = shiftMonthKey(state.ui.activeReportMonth, 1);
  state.ui.activeReportMonth = nextMonth;
  state.ui.activeReport = generateMonthlyReport(state.entries, nextMonth);

  renderApp();
}

export function handleActionClick(action) {
  switch (action) {
    case "generate-report":
      openReportModal();
      break;

    case "close-report-modal":
      closeReportModal();
      break;

    case "prev-report-month":
      goToPreviousReportMonth();
      break;

    case "next-report-month":
      goToNextReportMonth();
      break;

    default:
      break;
  }
}
