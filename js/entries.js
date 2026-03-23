import { state } from "./state.js";
import { generateId, getMonthKey } from "./utils.js";

const STORAGE_KEY = "dayledger-entries";

export function createEmptyEntry(date) {
  return {
    id: generateId("entry"),
    date,
    professional: {
      summary: "",
      wins: "",
      blockers: "",
      mood: "",
      hours: ""
    },
    personal: {
      summary: "",
      wins: "",
      blockers: "",
      mood: ""
    },
    reflection: {
      biggestLearning: "",
      gratitude: "",
      improvements: ""
    },
    status: "Not Started",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function loadEntries() {
  try {
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    state.entries = savedEntries ? JSON.parse(savedEntries) : [];
  } catch (error) {
    console.error("Failed to load entries from localStorage:", error);
    state.entries = [];
  }

  return state.entries;
}

export function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  } catch (error) {
    console.error("Failed to save entries to localStorage:", error);
  }
}

export function getEntryByDate(date) {
  return state.entries.find((entry) => entry.date === date) || null;
}

export function getEntryById(entryId) {
  return state.entries.find((entry) => entry.id === entryId) || null;
}

export function getOrCreateTodayEntry(date) {
  let entry = getEntryByDate(date);

  if (!entry) {
    entry = createEmptyEntry(date);
    state.entries.unshift(entry);
    saveEntries();
  }

  return entry;
}

export function saveEntry(entryData) {
  const existingIndex = state.entries.findIndex((entry) => entry.id === entryData.id);

  const normalizedEntry = {
    ...entryData,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex > -1) {
    state.entries[existingIndex] = normalizedEntry;
  } else {
    state.entries.unshift({
      ...normalizedEntry,
      createdAt: new Date().toISOString()
    });
  }

  saveEntries();
  return normalizedEntry;
}

export function updateEntryStatus(entry) {
  const hasProfessionalContent =
    entry.professional.summary ||
    entry.professional.wins ||
    entry.professional.blockers ||
    entry.professional.mood ||
    entry.professional.hours;

  const hasPersonalContent =
    entry.personal.summary ||
    entry.personal.wins ||
    entry.personal.blockers ||
    entry.personal.mood;

  const hasReflectionContent =
    entry.reflection.biggestLearning ||
    entry.reflection.gratitude ||
    entry.reflection.improvements;

  if (hasProfessionalContent && hasPersonalContent && hasReflectionContent) {
    entry.status = "Completed";
  } else if (hasProfessionalContent || hasPersonalContent || hasReflectionContent) {
    entry.status = "In Progress";
  } else {
    entry.status = "Not Started";
  }

  entry.updatedAt = new Date().toISOString();
  saveEntries();

  return entry.status;
}

export function getRecentEntries(limit = 5) {
  return [...state.entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getEntriesByMonth(dateString) {
  const targetMonthKey = getMonthKey(dateString);

  return state.entries.filter((entry) => getMonthKey(entry.date) === targetMonthKey);
}

export function deleteEntry(entryId) {
  state.entries = state.entries.filter((entry) => entry.id !== entryId);
  saveEntries();
}
