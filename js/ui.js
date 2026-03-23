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

function getSectionStatus(valueObject) {
  const hasContent = Object.values(valueObject).some((value) =>
    String(value || "").trim()
  );
  return hasContent ? "Done" : "Pending";
}

export function renderHeader() {
  const headerDateEl = document.querySelector("[data-today-date]");
  const headerGreetingEl = document.querySelector("[data-greeting]");

  if (headerDateEl) {
    headerDateEl.textContent = formatDisplayDate(state.today.date);
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
    renderTodayProgress(null);
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

  renderTodayProgress(todayEntry);
}

export function renderTodayProgress(todayEntry) {
  const progressChips = document.querySelectorAll(".progress-chip strong");

  if (!progressChips.length) return;

  if (!todayEntry) {
    progressChips[0].textContent = "Pending";
    progressChips[1].textContent = "Pending";
    progressChips[2].textContent = "Pending";
    return;
  }

  progressChips[0].textContent = getSectionStatus(todayEntry.professional);
  progressChips[1].textContent = getSectionStatus(todayEntry.personal);
  progressChips[2].textContent = getSectionStatus(todayEntry.reflection);
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

export function renderHistoryEntries(entries) {
  const historyListEl = document.querySelector("[data-history-list]");
  if (!historyListEl) return;

  if (!entries.length) {
    historyListEl.innerHTML = `
      <div class="empty-state">
        <p>No past entries found.</p>
      </div>
    `;
    return;
  }

  historyListEl.innerHTML = entries
    .map(
      (entry) => `
        <article class="history-item">
          <div class="history-item-top">
            <h4>${formatDisplayDate(entry.date)}</h4>
            <span class="status-badge ${getStatusClass(entry.status)}">${entry.status}</span>
          </div>
          <p><strong>Professional:</strong> ${truncateText(entry.professional.summary || "No professional update", 100)}</p>
          <p><strong>Personal:</strong> ${truncateText(entry.personal.summary || "No personal update", 100)}</p>

          <div class="history-actions">
            <button
              type="button"
              class="history-edit-btn"
              data-action="edit-entry"
              data-entry-id="${entry.id}"
            >
              Edit
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

export function openEntryModal() {
  const modal = document.querySelector("[data-entry-modal]");
  if (!modal) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closeEntryModal() {
  const modal = document.querySelector("[data-entry-modal]");
  if (!modal) return;

  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

export function openHistoryModal() {
  const modal = document.querySelector("[data-history-modal]");
  if (!modal) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closeHistoryModal() {
  const modal = document.querySelector("[data-history-modal]");
  if (!modal) return;

  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

export function populateEntryForm(entry) {
  const form = document.querySelector("[data-entry-form]");
  if (!form || !entry) return;

  form.dataset.editingEntryId = entry.id;

  form.professionalSummary.value = entry.professional.summary || "";
  form.professionalWins.value = entry.professional.wins || "";
  form.professionalBlockers.value = entry.professional.blockers || "";
  form.professionalMood.value = entry.professional.mood || "";
  form.professionalHours.value = entry.professional.hours || "";

  form.personalSummary.value = entry.personal.summary || "";
  form.personalWins.value = entry.personal.wins || "";
  form.personalBlockers.value = entry.personal.blockers || "";
  form.personalMood.value = entry.personal.mood || "";

  form.biggestLearning.value = entry.reflection.biggestLearning || "";
  form.gratitude.value = entry.reflection.gratitude || "";
  form.improvements.value = entry.reflection.improvements || "";
}

export function resetEntryForm() {
  const form = document.querySelector("[data-entry-form]");
  if (!form) return;
  form.reset();
  delete form.dataset.editingEntryId;
}

export function renderAll() {
  renderHeader();
  renderDashboardStats();
  renderTodayCard();
  renderRecentEntries();
  renderReportSnapshot();
}
