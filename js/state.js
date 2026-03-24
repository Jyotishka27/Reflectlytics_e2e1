export const state = {
  app: {
    name: "DayLedger",
    version: "0.1.0"
  },

  currentUser: {
    id: "jyotishka-demo",
    name: "Jyotishka"
  },

  today: {
    date: "",
    dayName: "",
    monthName: "",
    year: ""
  },

  entries: [],

  reports: [],

  dashboard: {
    stats: {
      todaysStatus: "Not Started",
      currentStreak: 0,
      monthEntries: 0,
      lastReport: "No report generated"
    }
  },

  ui: {
    activeSection: "dashboard",
    isEntryFormOpen: false,
    isEditingEntry: false,
    selectedEntryId: null,
  
    isHistoryModalOpen: false,
  
    isReportModalOpen: false,
    activeReportMonth: "",
    activeReport: null
  }
};
