// לקוח מדומה שמחקה את ה-API של base44 (entities / auth / users / app),
// כדי שכל שאר האפליקציה תוכל לעבוד במצב בדיקה בלי לגעת בבסיס הנתונים האמיתי
// ובלי צורך בהתחברות אמיתית.
import { MockStore } from "@/lib/mock/store";
import { buildSeed, MOCK_USER } from "@/lib/mock/seed";
import { disableTestMode } from "@/lib/mock/testMode";

const ENTITY_NAMES = [
  "Gap",
  "GapChange",
  "GapUpdate",
  "Constraint",
  "Event",
  "DailyRoutine",
  "DailySummary",
  "AccessRequest",
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function createMockBase44() {
  const store = new MockStore(buildSeed);

  const entities = {};
  ENTITY_NAMES.forEach((name) => {
    entities[name] = store.entity(name);
  });

  return {
    __mock: true,
    entities,
    auth: {
      me: async () => clone(MOCK_USER),
      // "התנתקות" ממצב בדיקה = יציאה ממנו וחזרה למסך האמיתי
      logout: () => disableTestMode(),
      redirectToLogin: () => {},
    },
    users: {
      inviteUser: async () => ({ success: true }),
    },
    app: {
      getPublicSettings: async () => ({ id: "mock-app", public_settings: {} }),
    },
  };
}
