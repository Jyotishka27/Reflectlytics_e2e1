export function buildMonthlyReportAIPayload(report) {
  if (!report) return null;

  return {
    month: report.period?.label || "",
    totals: {
      entries: report.totals?.entries || 0,
      completed: report.totals?.completed || 0,
      inProgress: report.totals?.inProgress || 0,
      emptyDays: report.totals?.emptyDays || 0,
      professionalHours: report.totals?.professionalHours || 0
    },
    patterns: {
      topWins: (report.patterns?.topWins || []).map((item) => ({
        label: item.label,
        count: item.count
      })),
      topBlockers: (report.patterns?.topBlockers || []).map((item) => ({
        label: item.label,
        count: item.count
      })),
      professionalMoods: (report.patterns?.professionalMoods || []).map((item) => ({
        label: item.label,
        count: item.count
      })),
      personalMoods: (report.patterns?.personalMoods || []).map((item) => ({
        label: item.label,
        count: item.count
      }))
    },
    highlights: {
      learnings: (report.highlights?.learnings || []).map((item) => item.text),
      reflections: (report.highlights?.reflections || []).map((item) => item.text),
      gratitude: (report.highlights?.gratitude || []).map((item) => item.text)
    },
    meta: {
      sourceEntryCount: report.meta?.sourceEntryCount || 0,
      readyForLLM: report.meta?.readyForLLM || false
    }
  };
}

export function buildMonthlySummaryPrompt(report) {
  const payload = buildMonthlyReportAIPayload(report);

  if (!payload) return "";

  return `
You are an insightful productivity and reflection assistant.

Your task is to analyze a user's monthly self-tracking report and produce a clear, supportive monthly review.

Write the response in this structure:
1. Monthly overview
2. What went well
3. Recurring blockers
4. Emotional / mood pattern
5. Key lessons
6. Suggested focus for next month

Instructions:
- Be specific and grounded in the data provided
- Do not invent facts
- Keep the tone supportive, reflective, and practical
- Keep it concise but meaningful
- Mention repeated patterns where relevant
- If data is missing, say so naturally

Monthly report data:
${JSON.stringify(payload, null, 2)}
  `.trim();
}

export function buildMonthlyCoachPrompt(report) {
  const payload = buildMonthlyReportAIPayload(report);

  if (!payload) return "";

  return `
You are a practical personal coach reviewing a user's monthly self-tracking report.

Your task is to provide:
1. The user's strongest behavior pattern
2. The biggest issue holding them back
3. One mindset observation
4. Three practical actions for next month

Instructions:
- Use only the provided data
- Be direct, constructive, and realistic
- Avoid fluff
- Do not invent missing details
- Base your advice on repeated wins, blockers, moods, and reflections

Monthly report data:
${JSON.stringify(payload, null, 2)}
  `.trim();
}
