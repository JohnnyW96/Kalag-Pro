// לקוח מדומה שמחקה את ה-API של base44 (entities / auth / users / app),
// כדי שכל שאר האפליקציה תוכל לעבוד במצב בדיקה בלי לגעת בבסיס הנתונים האמיתי
// ובלי צורך בהתחברות אמיתית.
import { MockStore } from "@/lib/mock/store";
import { buildSeed, MOCK_USER } from "@/lib/mock/seed";
import { disableTestMode } from "@/lib/mock/testMode";

// כל ישות שמופיעה כאן חייבת להיות רשומה, אחרת base44.entities.<Name> יהיה undefined
// ותקרוס בכל מסך שמנסה לקרוא/לכתוב אליה (זו הייתה הסיבה שהסטטיסטיקה לא עבדה במצב בדיקה —
// DirectTask/TaskCompletion/וכו' לא היו ברשימה).
const ENTITY_NAMES = [
  "Gap",
  "GapChange",
  "GapUpdate",
  "Constraint",
  "Event",
  "DailyRoutine",
  "DailySummary",
  "AccessRequest",
  "User",
  "WarehouseItem",
  "WithdrawalRequest",
  "EquipmentHolding",
  "EquipmentSettings",
  "DirectTask",
  "TaskCompletion",
  "RecurringEvent",
  "RecurringOverride",
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

// שגיאה בצורת ה-SDK האמיתי (err.response.data.error), כדי שקוד הטיפול בשגיאות
// הקיים (WithdrawalForm, Login, UserNotRegisteredError) יעבוד זהה במצב בדיקה.
function functionError(message, status = 400) {
  const err = new Error(message);
  err.response = { status, data: { error: message } };
  return err;
}

// מימוש מדומה לפונקציית השרת processWithdrawal: בודק מלאי, מוריד כמות מהמחסן,
// יוצר רשומת בקשת משיכה, ועוקב אחרי ציוד "להחזרה" ב-EquipmentHolding —
// בדיוק כמו base44/functions/processWithdrawal/entry.ts, רק מול ה-store המדומה.
async function mockProcessWithdrawal(store, currentUser, body) {
  const { warehouse, items, pluga, expected_return_date, notes } = body || {};
  if (!warehouse || !items || !items.length || !pluga) {
    throw functionError("חסרים פרטים (מחסן, פריטים, פלוגה)");
  }

  const today = new Date().toISOString().split("T")[0];
  const warehouseItemEntity = store.entity("WarehouseItem");
  const warehouseItems = await warehouseItemEntity.filter({ warehouse });

  const updates = [];
  for (const item of items) {
    const wi = warehouseItems.find((w) => w.name === item.name);
    if (!wi) throw functionError(`פריט "${item.name}" לא נמצא במחסן`);
    if (wi.quantity < item.quantity) {
      throw functionError(`אין מספיק "${item.name}" במלאי (יש ${wi.quantity}, ביקשת ${item.quantity})`);
    }
    updates.push({ id: wi.id, quantity: wi.quantity - item.quantity });
  }
  for (const u of updates) {
    await warehouseItemEntity.update(u.id, { quantity: u.quantity });
  }

  const withdrawal = await store.entity("WithdrawalRequest").create({
    warehouse,
    items: items.map((i) => ({ name: i.name, quantity: i.quantity, returnable: i.returnable })),
    requested_by_name: currentUser.full_name || currentUser.email,
    pluga,
    request_date: today,
    expected_return_date: expected_return_date || "",
    notes: notes || "",
  });

  const returnableItems = items.filter((i) => i.returnable);
  if (returnableItems.length > 0) {
    const holdingEntity = store.entity("EquipmentHolding");
    for (const i of returnableItems) {
      await holdingEntity.create({
        item_name: i.name,
        warehouse,
        quantity: i.quantity,
        pluga,
        held_by_name: currentUser.full_name || currentUser.email,
        withdrawal_date: today,
        expected_return_date: expected_return_date || "",
      });
    }
  }

  // אין שליחת מייל אמיתית במצב בדיקה — רק מדלגים על השלב הזה בשקט.
  return { success: true, withdrawal };
}

// מימוש מדומה לפונקציית השרת submitAccessRequest (רלוונטי בעיקר למסך ההתחברות;
// במצב בדיקה המשתמש כבר "מחובר" כ-MOCK_USER כך שהזרימה הזו כמעט ולא נדרשת בפועל).
async function mockSubmitAccessRequest(store, body) {
  const email = (body?.email || "").toString().trim().toLowerCase();
  const full_name = (body?.full_name || "").toString().trim();
  if (!email || !email.includes("@")) throw functionError("נדרש אימייל תקין");

  const accessRequestEntity = store.entity("AccessRequest");
  const existing = await accessRequestEntity.filter({ email });
  if (existing.length > 0) {
    const pending = existing.find((r) => r.status === "pending");
    throw functionError(pending ? "הבקשה כבר נשלחה וממתינה לאישור" : "כבר הוגשה בקשה עם אימייל זה", 409);
  }

  await accessRequestEntity.create({ email, full_name, status: "pending", assigned_role: "" });
  return { success: true };
}

const MOCK_FUNCTIONS = {
  processWithdrawal: mockProcessWithdrawal,
  submitAccessRequest: (store, currentUser, body) => mockSubmitAccessRequest(store, body),
};

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
    functions: {
      invoke: async (name, body) => {
        const handler = MOCK_FUNCTIONS[name];
        if (!handler) {
          throw functionError(`פונקציה "${name}" אינה נתמכת במצב בדיקה`, 501);
        }
        const data = await handler(store, clone(MOCK_USER), body);
        return { data };
      },
    },
    asServiceRole: {
      entities,
      integrations: {
        Core: {
          SendEmail: async () => ({ success: true }),
        },
      },
    },
  };
}
