import { state } from "./state.js";
import { getTodayParts } from "./utils.js";
import {
  loadEntries,
  getEntryByDate,
  getEntryById,
  getEntriesByMonth,
  getOrCreateTodayEntry,
  getRecentEntries,
  saveEntry,
  updateEntryStatus
} from "./entries.js";
import { getLatestReportLabel } from "./reports.js";
import {
  renderAll,
  renderHistoryEntries,
  openEntryModal,
  closeEntryModal,
  openHistoryModal,
  closeHistoryModal,
  populateEntryForm,
  resetEntryForm
} from "./ui.js";

function setToday() {
  state.today = getTodayParts();
}

function calculateCurrentStreak() {
  if (!state.entries.length) return 0;

  const uniqueDates = [...new Set(state.entries.map((entry) => entry.date))].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let streak = 0;
  const today = new Date(state.today.date);

  for (let i = 0; i < uniqueDates.length; i += 1) {
    const compareDate = new Date(today);
    compareDate.setDate(today.getDate() - i);

    const currentEntryDate = new Date(uniqueDates[i]);

    if (currentEntryDate.toDateString() === compareDate.toDateString()) {
      streak += 1;
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

function openTodayEntry() {
  const todayEntry = getOrCreateTodayEntry(state.today.date);
  updateEntryStatus(todayEntry);
  populateEntryForm(todayEntry);
  openEntryModal();
  refreshDashboardStats();
  renderAll();
}

function openEntryForEdit(entryId) {
  const entry = getEntryById(entryId);
  if (!entry) return;

  closeHistoryModal();
  populateEntryForm(entry);
  openEntryModal();
}

function openPastEntries() {
  const sortedEntries = [...state.entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  renderHistoryEntries(sortedEntries);
  openHistoryModal();
}

function collectFormData(form, fallbackEntry) {
  const editingEntryId = form.dataset.editingEntryId;
  const existingEntry = editingEntryId ? getEntryById(editingEntryId) : fallbackEntry;

  return {
    ...existingEntry,
    professional: {
      summary: form.professionalSummary.value.trim(),
      wins: form.professionalWins.value.trim(),
      blockers: form.professionalBlockers.value.trim(),
      mood: form.professionalMood.value.trim(),
      hours: form.professionalHours.value.trim()
    },
    personal: {
      summary: form.personalSummary.value.trim(),
      wins: form.personalWins.value.trim(),
      blockers: form.personalBlockers.value.trim(),
      mood: form.personalMood.value.trim()
    },
    reflection: {
      biggestLearning: form.biggestLearning.value.trim(),
      gratitude: form.gratitude.value.trim(),
      improvements: form.improvements.value.trim()
    }
  };
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const action = event.target.dataset.action;

    if (!action) return;

    if (action === "open-entry-form") {
      openTodayEntry();
    }

    if (action === "close-entry-form") {
      closeEntryModal();
      resetEntryForm();
    }

    if (action === "view-past-entries") {
      openPastEntries();
    }

    if (action === "close-history-modal") {
      closeHistoryModal();
    }

    if (action === "edit-entry") {
      openEntryForEdit(event.target.dataset.entryId);
    }

    if (action === "generate-report") {
      alert("Report generation comes later.");
    }
  });

  const form = document.querySelector("[data-entry-form]");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const todayFallbackEntry = getOrCreateTodayEntry(state.today.date);
      const updatedEntry = collectFormData(form, todayFallbackEntry);

      saveEntry(updatedEntry);
      updateEntryStatus(updatedEntry);
      refreshDashboardStats();
      renderAll();
      closeEntryModal();
      resetEntryForm();
    });
  }

  const entryModal = document.querySelector("[data-entry-modal]");
  if (entryModal) {
    entryModal.addEventListener("click", (event) => {
      if (event.target === entryModal) {
        closeEntryModal();
      }
    });
  }

  const historyModal = document.querySelector("[data-history-modal]");
  if (historyModal) {
    historyModal.addEventListener("click", (event) => {
      if (event.target === historyModal) {
        closeHistoryModal();
      }
    });
  }
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
