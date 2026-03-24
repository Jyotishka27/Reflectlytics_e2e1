import { state } from "./state.js";
import { formatDisplayDate, getMonthKey, truncateText } from "./utils.js";
import { handleActionClick } from "./actions.js";

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function getTodayEntry() {
  return state.entries.find((entry) => entry.date === state.today.date) || null;
}

function renderHeader() {
  const greetingEl = document.querySelector("[data-greeting]");
  const todayDateEl = document.querySelector("[data-today-date]");

  if (greetingEl) {
    greetingEl.textContent = `Welcome back, ${state.currentUser.name}.`;
  }

  if (todayDateEl) {
    todayDateEl.textContent = formatDisplayDate(state.today.date);
  }
}

function renderStats() {
  setText('[data-stat="todays-status"]', state.dashboard.stats.todaysStatus);
  setText('[data-stat="current-streak"]', String(state.dashboard.stats.currentStreak));
  setText('[data-stat="month-entries"]', String(state.dashboard.stats.monthEntries));
  setText('[data-stat="last-report"]', state.dashboard.stats.lastReport);
}

function renderTodayCard() {
  const container = document.querySelector("[data-today-card]");
  if (!container) return;

  const todayEntry = getTodayEntry();

  if (!todayEntry) {
    container.innerHTML = `
      <div class="card-inner">
        <h3>Today’s Update</h3>
        <p class="muted-text">No entry added for today yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-inner">
      <h3>Today’s Update</h3>
      <p><strong>Professional:</strong> ${truncateText(todayEntry.professionalSummary || "No professional update yet.", 120)}</p>
      <p><strong>Personal:</strong> ${truncateText(todayEntry.personalSummary || "No personal update yet.", 120)}</p>
      <p><strong>Learning:</strong> ${truncateText(todayEntry.biggestLearning || "No learning captured yet.", 120)}</p>
    </div>
  `;
}

function renderRecentEntries() {
  const container = document.querySelector("[data-recent-entries]");
  if (!container) return;

  if (!state.entries.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No entries yet. Start by adding today’s update.</p>
      </div>
    `;
    return;
  }

  const recentEntries = [...state.entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  container.innerHTML = recentEntries
    .map(
      (entry) => `
        <article class="entry-card">
          <div class="entry-card-header">
            <strong>${formatDisplayDate(entry.date)}</strong>
          </div>
          <p>${truncateText(entry.professionalSummary || entry.personalSummary || "No summary available.", 100)}</p>
        </article>
      `
    )
    .join("");
}

function renderMonthlySnapshot() {
  const container = document.querySelector("[data-report-snapshot]");
  if (!container) return;

  const currentMonthKey = getMonthKey(state.today.date);
  const currentMonthEntries = state.entries.filter(
    (entry) => getMonthKey(entry.date) === currentMonthKey
  );

  container.innerHTML = `
    <div class="card-inner">
      <h3>Monthly Snapshot</h3>
      <p><strong>Entries this month:</strong> ${currentMonthEntries.length}</p>
      <p class="muted-text">Generate a report to view deeper patterns and highlights.</p>
    </div>
  `;
}

function renderReportModal() {
  const modal = document.querySelector("[data-report-modal]");
  const periodLabel = document.querySelector("[data-report-period-label]");
  const content = document.querySelector("[data-report-content]");

  if (!modal || !periodLabel || !content) return;

  modal.classList.toggle("hidden", !state.ui.isReportModalOpen);

  if (!state.ui.activeReport) {
    periodLabel.textContent = "No Month Selected";
    content.innerHTML = `
      <div class="empty-state">
        <p>No report generated yet.</p>
      </div>
    `;
    return;
  }

  const report = state.ui.activeReport;

  periodLabel.textContent = report.period.label;

  content.innerHTML = `
    <div class="report-grid">
      <article class="stat-card">
        <span>Total Entries</span>
        <strong>${report.totals.entries}</strong>
      </article>

      <article class="stat-card">
        <span>Completed</span>
        <strong>${report.totals.completed}</strong>
      </article>

      <article class="stat-card">
        <span>In Progress</span>
        <strong>${report.totals.inProgress}</strong>
      </article>

      <article class="stat-card">
        <span>Empty Days</span>
        <strong>${report.totals.emptyDays}</strong>
      </article>

      <article class="stat-card">
        <span>Professional Hours</span>
        <strong>${report.totals.professionalHours}</strong>
      </article>
    </div>

    <section class="panel report-section">
      <div class="section-title">
        <div>
          <h3>Top Wins</h3>
          <p>Most repeated positive patterns this month.</p>
        </div>
      </div>
      ${
        report.patterns.topWins.length
          ? `
            <div class="tag-list">
              ${report.patterns.topWins
                .map((item) => `<span class="tag">${item.label} (${item.count})</span>`)
                .join("")}
            </div>
          `
          : `<div class="empty-state"><p>No wins logged this month.</p></div>`
      }
    </section>

    <section class="panel report-section">
      <div class="section-title">
        <div>
          <h3>Top Blockers</h3>
          <p>What slowed you down the most.</p>
        </div>
      </div>
      ${
        report.patterns.topBlockers.length
          ? `
            <div class="tag-list">
              ${report.patterns.topBlockers
                .map((item) => `<span class="tag">${item.label} (${item.count})</span>`)
                .join("")}
            </div>
          `
          : `<div class="empty-state"><p>No blockers logged this month.</p></div>`
      }
    </section>

    <section class="panel report-section">
      <div class="section-title">
        <div>
          <h3>Learning Highlights</h3>
          <p>Recent lessons captured during the month.</p>
        </div>
      </div>
      ${
        report.highlights.learnings.length
          ? report.highlights.learnings
              .map(
                (item) => `
                  <article class="history-item">
                    <strong>${formatDisplayDate(item.date)}</strong>
                    <p>${item.text}</p>
                  </article>
                `
              )
              .join("")
          : `<div class="empty-state"><p>No learning highlights yet.</p></div>`
      }
    </section>

    <section class="panel report-section">
      <div class="section-title">
        <div>
          <h3>Reflection Highlights</h3>
          <p>Recent improvements and self-review notes.</p>
        </div>
      </div>
      ${
        report.highlights.reflections.length
          ? report.highlights.reflections
              .map(
                (item) => `
                  <article class="history-item">
                    <strong>${formatDisplayDate(item.date)}</strong>
                    <p>${item.text}</p>
                  </article>
                `
              )
              .join("")
          : `<div class="empty-state"><p>No reflection highlights yet.</p></div>`
      }
    </section>
  `;
}

function bindActionButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.onclick = () => {
      const action = button.dataset.action;
      handleActionClick(action);
    };
  });
}

export function renderApp() {
  renderHeader();
  renderStats();
  renderTodayCard();
  renderRecentEntries();
  renderMonthlySnapshot();
  renderReportModal();
  bindActionButtons();
}
