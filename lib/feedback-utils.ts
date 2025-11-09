export const looksLikeJsonString = (value: string) => {
  const trimmed = value?.trim?.();
  if (!trimmed) return false;
  const first = trimmed[0];
  return first === "{" || first === "[";
};

export const safeParseJson = <T = any>(value: unknown): T | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      return null;
    }
  }

  if (!looksLikeJsonString(value)) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return null;
  }
};

const normalizeSkillName = (value?: string | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const buildSkillProgressFromFeedback = (
  jobSkills: string[] = [],
  feedback: any
) => {
  const matched: string[] = Array.isArray(feedback?.skillsAnalysis?.matched)
    ? feedback.skillsAnalysis.matched
    : [];
  const missing: string[] = Array.isArray(feedback?.skillsAnalysis?.missing)
    ? feedback.skillsAnalysis.missing
    : [];
  const exceeds: string[] = Array.isArray(feedback?.skillsAnalysis?.exceeds)
    ? feedback.skillsAnalysis.exceeds
    : [];

  const added = new Set<string>();
  const results: { name: string; score: number; maxScore: number }[] = [];

  const addSkill = (name: string, score: number) => {
    if (!name) return;
    const key = normalizeSkillName(name);
    if (added.has(key)) return;
    results.push({
      name,
      score: Math.max(0, Math.min(score, 100)),
      maxScore: 100,
    });
    added.add(key);
  };

  jobSkills.forEach((skill) => {
    const key = normalizeSkillName(skill);
    if (exceeds.some((value) => normalizeSkillName(value) === key)) {
      addSkill(skill, 100);
    } else if (matched.some((value) => normalizeSkillName(value) === key)) {
      addSkill(skill, 85);
    } else if (missing.some((value) => normalizeSkillName(value) === key)) {
      addSkill(skill, 35);
    } else {
      addSkill(skill, 60);
    }
  });

  exceeds.forEach((skill) => addSkill(skill, 95));
  matched.forEach((skill) => addSkill(skill, 80));
  missing.forEach((skill) => addSkill(skill, 25));

  return results;
};

export const formatDateLabel = (value?: string | Date | null) => {
  if (!value) return null;
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
};

