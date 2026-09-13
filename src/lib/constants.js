export const PLUGOT = ["פארן", "בשור", "צין", "רמון", "תמר"];

export const LOCATIONS = [
  "מגורי בנים",
  "מגורי בנות",
  "כיתות",
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

// מיקומים שבהם מבקשים גם מבנה ומספר חדר (מגורים/כיתות)
export const DORM_LOCATIONS = ["מגורי בנים", "מגורי בנות", "כיתות"];

export const PLUGA_COLORS = {
  "פארן": { bg: "bg-blue-500", text: "text-white", light: "bg-blue-100", border: "border-blue-400", dot: "bg-blue-500" },
  "בשור": { bg: "bg-green-500", text: "text-white", light: "bg-green-100", border: "border-green-400", dot: "bg-green-500" },
  "צין": { bg: "bg-black", text: "text-white", light: "bg-gray-200", border: "border-neutral-700", dot: "bg-black" },
  "רמון": { bg: "bg-red-500", text: "text-white", light: "bg-red-100", border: "border-red-400", dot: "bg-red-500" },
  "תמר": { bg: "bg-yellow-400", text: "text-slate-900", light: "bg-yellow-100", border: "border-yellow-400", dot: "bg-yellow-400" },
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

export const SHOTAF_OPTIONS = ["טרם הוחלט", ...PLUGOT];

export const EVENT_COLORS = {
  bg: "bg-slate-300",
  text: "text-slate-900",
  light: "bg-slate-100",
  border: "border-slate-400",
  dot: "bg-slate-400",
};
