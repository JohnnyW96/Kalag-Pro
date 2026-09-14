// מפתחות אחסון משותפים למצב הבדיקה (localStorage).
// SEED_VERSION מאפשר לפסול נתונים ישנים שנשמרו לפני שינוי במבנה הדאטא הדמה —
// כל שינוי משמעותי ב-seed.js צריך להעלות את המספר הזה כדי שהמשתמשים יקבלו סט טרי.
export const TEST_MODE_KEY = "kalag_test_mode";
export const MOCK_DB_KEY = "kalag_mock_db_v1";
export const SEED_VERSION = 2;
