import { state } from "./state.js";
import { getTodayParts } from "./utils.js";
import {
  loadEntries,
  getEntryByDate,
  getEntriesByMonth,
  updateEntryStatus
} from "./entries.js";
import { getLatestReportLabel } from "./reports.js";
import { renderAll } from "./ui.js";

function setToday() {
  state.today = getTodayParts();
}

function calculateCurrentStreak() {
  if (!state.entries.length) return 0;

  const sortedDates = [...state.entries]
    .map((entry) => entry.date)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let currentDate = new Date(state.today.date);

  for (let i = 0; i < sortedDates.length; i += 1) {
    const entryDate = new Date(sortedDates[i]);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(currentDate.getDate() - streak);

    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak += 1;
    } else if (i === 0 && entryDate.toDateString() !== currentDate.toDateString()) {
      break;
    } else {
      break;
    }
  }

  return streak;
}

function refreshDashboardStats() {
  const todayEntry = getEntryByDate(state.today.date);
  const monthEntries = getEntriesByMonth(state.today.date);

  if (todayEntry) {
    updateEntryStatus(todayEntry);
  }

  state.dashboard.stats.todaysStatus = todayEntry ? todayEntry.status : "Not Started";
  state.dashboard.stats.currentStreak = calculateCurrentStreak();
  state.dashboard.stats.monthEntries = monthEntries.length;
  state.dashboard.stats.lastReport = getLatestReportLabel();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const action = event.target.dataset.action;

    if (!action) return;

    if (action === "open-entry-form") {
      alert("Entry form UI comes next.");
    }

    if (action === "generate-report") {
      alert("Report generation comes later.");
    }
  });
}

function initApp() {
  setToday();
  loadEntries();
  refreshDashboardStats();
  bindEvents();
  renderAll();

  console.log(`${state.app.name} initialized`);
}

document.addEventListener("DOMContentLoaded", initApp);
