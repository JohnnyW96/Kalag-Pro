// שליטה במצב הבדיקה: הפעלה/כיבוי/איפוס.
// כל פעולה כאן שומרת דגל ב-localStorage ואז טוענת מחדש את הדף — כך ש-base44Client.js
// (הנטען פעם אחת בעליית האפליקציה) יבחר מחדש בין הלקוח האמיתי ללקוח המדומה.
import { TEST_MODE_KEY, MOCK_DB_KEY } from "@/lib/mock/constants";

export function isTestMode() {
  try {
    return window.localStorage.getItem(TEST_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function enableTestMode() {
  try {
    window.localStorage.setItem(TEST_MODE_KEY, "1");
  } catch {
    // localStorage לא זמין — אין מה לעשות
  }
  window.location.reload();
}

export function disableTestMode() {
  try {
    window.localStorage.removeItem(TEST_MODE_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}

export function toggleTestMode() {
  if (isTestMode()) {
    disableTestMode();
  } else {
    enableTestMode();
  }
}

// מוחק את נתוני הבדיקה השמורים כדי שבטעינה הבאה ייווצר סט דוגמה חדש ונקי
export function resetTestData() {
  try {
    window.localStorage.removeItem(MOCK_DB_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}
