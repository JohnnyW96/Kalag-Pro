import { FlaskConical, X, RotateCcw } from "lucide-react";
import { isTestMode, enableTestMode, disableTestMode, resetTestData } from "@/lib/mock/testMode";

// כפתור/באנר גלובלי למצב בדיקה — מוצג בכל מסך (כולל מסך התחברות),
// כדי שאפשר יהיה להיכנס למצב בדיקה גם בלי גישה תקינה ל-base44 האמיתי.
export default function TestModeToggle() {
  const active = isTestMode();

  if (!active) {
    return (
      <button
        type="button"
        onClick={enableTestMode}
        dir="rtl"
        className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
        title="הפעלת מצב בדיקה עם נתוני דוגמה"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        מצב בדיקה
      </button>
    );
  }

  return (
    <>
      <div
        dir="rtl"
        className="bg-amber-400 text-amber-950 text-xs sm:text-sm font-medium px-3 py-2 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-center"
      >
        <span className="flex items-center gap-1.5">
          <FlaskConical className="w-4 h-4 shrink-0" />
          מצב בדיקה פעיל — כל הנתונים המוצגים הם נתוני דוגמה ואינם נשמרים במערכת האמיתית
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("לאפס את נתוני הבדיקה בחזרה למצב ההתחלתי?")) {
              resetTestData();
            }
          }}
          className="flex items-center gap-1 underline hover:no-underline shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          איפוס נתונים
        </button>
      </div>
      <button
        type="button"
        onClick={disableTestMode}
        dir="rtl"
        className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 bg-amber-500 text-amber-950 text-xs font-medium px-3 py-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        title="יציאה ממצב בדיקה"
      >
        <X className="w-3.5 h-3.5" />
        יציאה ממצב בדיקה
      </button>
    </>
  );
}
