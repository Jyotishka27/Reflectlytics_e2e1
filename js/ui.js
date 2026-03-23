import { state } from "./state.js";
import { formatDisplayDate, truncateText } from "./utils.js";
import { getRecentEntries, getEntryByDate } from "./entries.js";
import { buildMonthlyReportSnapshot } from "./reports.js";

function getStatusClass(status) {
  switch (status) {
    case "Completed":
      return "status-completed";
    case "In Progress":
      return "status-progress";
    default:
      return "status-pending";
  }
}

export function renderHeader() {
  const headerDateEl = document.querySelector("[data-today-date]");
  const headerGreetingEl = document.querySelector("[data-greeting]");

  if (headerDateEl) {
    headerDateEl.textContent = `${state.today.dayName}, ${state.today.date}`;
  }

  if (headerGreetingEl) {
    headerGreetingEl.textContent = `Welcome back, ${state.currentUser.name}.`;
  }
}

export function renderDashboardStats() {
  const stats = state.dashboard.stats;

  const todaysStatusEl = document.querySelector("[data-stat='todays-status']");
  const streakEl = document.querySelector("[data-stat='current-streak']");
  const monthEntriesEl = document.querySelector("[data-stat='month-entries']");
  const lastReportEl = document.querySelector("[data-stat='last-report']");

  if (todaysStatusEl) todaysStatusEl.textContent = stats.todaysStatus;
  if (streakEl) streakEl.textContent = stats.currentStreak;
  if (monthEntriesEl) monthEntriesEl.textContent = stats.monthEntries;
  if (lastReportEl) lastReportEl.textContent = stats.lastReport;
}

export function renderTodayCard() {
  const todayCardEl = document.querySelector("[data-today-card]");

  if (!todayCardEl) return;

  const todayEntry = getEntryByDate(state.today.date);

  if (!todayEntry) {
    todayCardEl.innerHTML = `
      <div class="card-inner">
        <h3>Today’s Update</h3>
        <p>No update started yet.</p>
        <button type="button" data-action="open-entry-form">Start Today’s Entry</button>
      </div>
    `;
    return;
  }

  todayCardEl.innerHTML = `
    <div class="card-inner">
      <div class="card-top">
        <h3>Today’s Update</h3>
        <span class="status-badge ${getStatusClass(todayEntry.status)}">${todayEntry.status}</span>
      </div>
      <p><strong>Professional:</strong> ${truncateText(todayEntry.professional.summary || "No professional update yet.", 70)}</p>
      <p><strong>Personal:</strong> ${truncateText(todayEntry.personal.summary || "No personal update yet.", 70)}</p>
      <button type="button" data-action="open-entry-form">Continue Today’s Entry</button>
    </div>
  `;
}

export function renderRecentEntries() {
  const recentEntriesEl = document.querySelector("[data-recent-entries]");

  if (!recentEntriesEl) return;

  const recentEntries = getRecentEntries(5);

  if (!recentEntries.length) {
    recentEntriesEl.innerHTML = `
      <div class="empty-state">
        <p>No entries logged yet.</p>
      </div>
    `;
    return;
  }

  recentEntriesEl.innerHTML = recentEntries
    .map(
      (entry) => `
        <article class="entry-item">
          <div class="entry-item-top">
            <h4>${formatDisplayDate(entry.date)}</h4>
            <span class="status-badge ${getStatusClass(entry.status)}">${entry.status}</span>
          </div>
          <p><strong>Professional:</strong> ${truncateText(entry.professional.summary || "No professional update", 80)}</p>
          <p><strong>Personal:</strong> ${truncateText(entry.personal.summary || "No personal update", 80)}</p>
        </article>
      `
    )
    .join("");
}

export function renderReportSnapshot() {
  const reportSnapshotEl = document.querySelector("[data-report-snapshot]");

  if (!reportSnapshotEl) return;

  const snapshot = buildMonthlyReportSnapshot(state.today.date);

  reportSnapshotEl.innerHTML = `
    <div class="card-inner">
      <h3>${snapshot.title}</h3>
      <p><strong>Total entries:</strong> ${snapshot.totalEntries}</p>
      <p><strong>Completed entries:</strong> ${snapshot.completedEntries}</p>
      <p><strong>In progress:</strong> ${snapshot.inProgressEntries}</p>
      <p>${snapshot.summary}</p>
      <button type="button" data-action="generate-report" disabled>Generate Report</button>
    </div>
  `;
}

export function renderAll() {
  renderHeader();
  renderDashboardStats();
  renderTodayCard();
  renderRecentEntries();
  renderReportSnapshot();
}
