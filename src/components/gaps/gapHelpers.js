// פונקציות עזר משותפות למסך הפערים (כרטיסים, טבלה, סטטיסטיקות, ייצוא)

export const STATUSES = ["טרם הועלה", "בטיפול", "טופל"];
export const PRIORITIES = ["נמוך", "בינוני", "גבוה", "קריטי"];

export const PRIORITY_RANK = { "קריטי": 4, "גבוה": 3, "בינוני": 2, "נמוך": 1 };

export const STATUS_STYLES = {
  "טרם הועלה": "bg-amber-100 text-amber-800 border-amber-200",
  "בטיפול": "bg-blue-100 text-blue-800 border-blue-200",
  "טופל": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const PRIORITY_STYLES = {
  "נמוך": "bg-slate-100 text-slate-600",
  "בינוני": "bg-sky-100 text-sky-700",
  "גבוה": "bg-orange-100 text-orange-700",
  "קריטי": "bg-red-100 text-red-700 ring-1 ring-red-200",
};

// צבעי "נקודה" אחידים לסטטוס/עדיפות — לשימוש בתפריטי בחירה, מסננים וגרפים
export const STATUS_DOT = {
  "טרם הועלה": "bg-amber-500",
  "בטיפול": "bg-blue-500",
  "טופל": "bg-emerald-500",
};

export const PRIORITY_DOT = {
  "נמוך": "bg-slate-400",
  "בינוני": "bg-sky-500",
  "גבוה": "bg-orange-500",
  "קריטי": "bg-red-500",
};

export const STATUS_SELECTED_STYLES = {
  "טרם הועלה": "bg-amber-500 text-white border-amber-500",
  "בטיפול": "bg-blue-500 text-white border-blue-500",
  "טופל": "bg-emerald-500 text-white border-emerald-500",
};

export const PRIORITY_SELECTED_STYLES = {
  "נמוך": "bg-slate-500 text-white border-slate-500",
  "בינוני": "bg-sky-500 text-white border-sky-500",
  "גבוה": "bg-orange-500 text-white border-orange-500",
  "קריטי": "bg-red-500 text-white border-red-500",
};

// תוויות בעברית לשדות הפער, לשימוש ב-Changelog ובייצוא
export const GAP_FIELD_LABELS = {
  company: "פלוגה",
  gap: "תיאור הפער",
  location: "מיקום",
  building: "מבנה",
  room_number: "מספר חדר",
  status: "סטטוס",
  priority: "עדיפות",
  opened_at: "תאריך פתיחה",
  opened_by_name: "שם הפותח",
  opened_by_phone: "טלפון הפותח",
  note: "הערות",
};

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function currentUserLabel(user) {
  if (!user) return "";
  return user.full_name || user.email || "";
}

// בונה תוכן CSV (עם BOM כדי שעברית תיפתח נכון באקסל) מרשימת פערים גלויה
export function buildGapsCsv(gapsList, latestUpdatesMap) {
  const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const header = [
    "#", "פלוגה", "פער", "מיקום", "מבנה", "מספר חדר", "סטטוס", "עדיפות",
    "תאריך פתיחה", "נפתח על ידי", "טלפון", "הערות", "עודכן לאחרונה", "עדכון אחרון",
  ];
  const lines = [header.map(esc).join(",")];
  gapsList.forEach((r, i) => {
    const updMsg = (latestUpdatesMap && latestUpdatesMap[r.id] && latestUpdatesMap[r.id].message) || "";
    lines.push([
      i + 1,
      r.company,
      r.gap,
      r.location,
      r.building,
      r.room_number,
      r.status,
      r.priority,
      r.opened_at,
      r.opened_by_name,
      r.opened_by_phone,
      r.note,
      formatDateTime(r.updated_date),
      updMsg,
    ].map(esc).join(","));
  });
  return "﻿" + lines.join("\r\n");
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
