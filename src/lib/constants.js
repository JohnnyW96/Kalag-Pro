export const PLUGOT = ["פארן", "בשור", "צין", "רמון", "תמר"];

export const LOCATIONS = [
  "מגורי בנים",
  "מגורי בנות",
  "ספסלים",
  "שולחנות ספרייה",
  "פינת פריסה",
  "פינת קקס",
  "שביל",
  "פינת עישון",
  "כניסה למגורי בנים",
  "כניסה למגורי בנות",
  "רחבת רמון",
  "פינת ישיבה מאחורי הקמנים",
  "דקצו",
  "איזור שקם",
  "מתחם קמנים חיצוני",
  "שבילים מקיפי מתחם קמנים",
  "שביל צמוד למדרכה",
  "דשא כניסה למתחם",
  "פינת גלחצ",
];

export const PLUGA_COLORS = {
  "פארן": { bg: "bg-blue-500", text: "text-white", light: "bg-blue-100", border: "border-blue-400", dot: "bg-blue-500" },
  "בשור": { bg: "bg-emerald-500", text: "text-white", light: "bg-emerald-100", border: "border-emerald-400", dot: "bg-emerald-500" },
  "צין": { bg: "bg-amber-500", text: "text-white", light: "bg-amber-100", border: "border-amber-400", dot: "bg-amber-500" },
  "רמון": { bg: "bg-purple-500", text: "text-white", light: "bg-purple-100", border: "border-purple-400", dot: "bg-purple-500" },
  "תמר": { bg: "bg-rose-500", text: "text-white", light: "bg-rose-100", border: "border-rose-400", dot: "bg-rose-500" },
};

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export function formatHebrewDate(date) {
  if (typeof date === "string") {
    const parts = date.split("-").map(Number);
    date = new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const dayName = DAY_NAMES[date.getDay()];
  return `יום ${dayName} ה-${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}