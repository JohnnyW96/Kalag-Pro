// בונה סט נתוני דוגמה מלא ומגוון לכל הישויות באפליקציה, לשימוש במצב הבדיקה.
// כל התאריכים יחסיים ל"עכשיו" כדי שהנתונים תמיד ייראו רלוונטיים/עדכניים,
// גם כשמאפסים את מצב הבדיקה בשבוע אחר.
import { PLUGOT, DORM_LOCATIONS } from "@/lib/constants";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// תאריך (YYYY-MM-DD) לפני n ימים מהיום (n שלילי = בעתיד)
function dateOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

// חותמת זמן מלאה (ISO) לפני n ימים מהיום, בשעה נתונה
function isoOffset(n, hour = 9, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

// תאריך של יום מסוים בתוך שבוע נוכחי/עתידי, יחסית ליום ראשון של השבוע
function weekDateStr(dayOfWeek, weekOffset = 0) {
  const ws = getWeekStart(new Date());
  ws.setDate(ws.getDate() + weekOffset * 7 + dayOfWeek);
  return toDateStr(ws);
}

const NAMES = [
  { name: "יוסי כהן", phone: "050-1234567" },
  { name: "דנה לוי", phone: "052-2345678" },
  { name: "אורי פרץ", phone: "054-3456789" },
  { name: "מאיה אזולאי", phone: "053-4567890" },
  { name: "עומר ביטון", phone: "050-5678901" },
  { name: "נועה שרון", phone: "058-6789012" },
  { name: "אלון גבע", phone: "052-7890123" },
  { name: "שירה מזרחי", phone: "054-8901234" },
];

function person(i) {
  return NAMES[i % NAMES.length];
}

export function buildSeed() {
  // ---------- פערים (Gap) ----------
  const gapDefs = [
    { company: "פארן", gap: "ברז שבור בשירותים", location: "מגורי בנים", building: "3", room_number: "12", status: "טופל", priority: "גבוה", opened: 20, resolved: 15, note: "טופל ע\"י אינסטלטור" },
    { company: "בשור", gap: "תאורה לא עובדת בפינת הפריסה", location: "פינת פריסה", status: "בטיפול", priority: "קריטי", opened: 3, updated: 0 },
    { company: "צין", gap: "מזגן לא מקרר", location: "כיתות", building: "1", room_number: "4", status: "טרם הועלה", priority: "בינוני", opened: 1 },
    { company: "רמון", gap: "ספסל שבור ליד הקנטינה", location: "ספסלים", status: "טופל", priority: "נמוך", opened: 25, resolved: 20 },
    { company: "תמר", gap: "דלת ארון לא נסגרת", location: "מגורי בנות", building: "2", room_number: "7", status: "בטיפול", priority: "גבוה", opened: 6, updated: 1 },
    { company: "פארן", gap: "בור בשביל מהווה סכנת מעידה", location: "שבילים מקיפי מתחם קמנים", status: "טרם הועלה", priority: "קריטי", opened: 2 },
    { company: "בשור", gap: "ברז מים לא פועל", location: "פינת קקס", status: "טופל", priority: "בינוני", opened: 18, resolved: 10 },
    { company: "צין", gap: "שולחן מתנדנד", location: "שולחנות ספרייה", status: "בטיפול", priority: "נמוך", opened: 9, updated: 8 },
    { company: "רמון", gap: "חלון שבור", location: "מגורי בנים", building: "5", room_number: "20", status: "טרם הועלה", priority: "בינוני", opened: 4 },
    { company: "תמר", gap: "תאורת חוץ כבויה בכניסה", location: "כניסה למגורי בנות", status: "טופל", priority: "קריטי", opened: 14, resolved: 8 },
    { company: "פארן", gap: "פח אשפה הפוך", location: "פינת עישון", status: "בטיפול", priority: "בינוני", opened: 12, updated: 12 },
    { company: "בשור", gap: "שילוט חסר", location: "רחבת רמון", status: "טרם הועלה", priority: "נמוך", opened: 1 },
    { company: "צין", gap: "נזילת מים מהתקרה", location: "מגורי בנים", building: "1", room_number: "2", status: "טופל", priority: "גבוה", opened: 22, resolved: 19 },
    { company: "רמון", gap: "גדר פרוצה", location: "דקצו", status: "בטיפול", priority: "קריטי", opened: 5, updated: 1 },
    { company: "תמר", gap: "ריח רע מהביוב", location: "פינת גלחצ", status: "טרם הועלה", priority: "גבוה", opened: 2 },
    { company: "פארן", gap: "וילון קרוע", location: "מגורי בנות", building: "4", room_number: "15", status: "בטיפול", priority: "נמוך", opened: 10, updated: 10, note: "ממתין לוילון חדש" },
  ];

  const Gap = gapDefs.map((g, i) => {
    const p = person(i);
    const openedAtDate = dateOffset(g.opened);
    const createdIso = isoOffset(g.opened, 8 + (i % 6), (i * 7) % 60);
    const updatedDaysAgo = g.status === "טופל" ? g.resolved : (g.updated != null ? g.updated : Math.max(0, g.opened - 1));
    const updatedIso = isoOffset(updatedDaysAgo, 9 + (i % 5), (i * 11) % 60);
    return {
      id: `gap-${i + 1}`,
      company: g.company,
      gap: g.gap,
      location: g.location,
      building: g.building || "",
      room_number: g.room_number || "",
      status: g.status,
      priority: g.priority,
      note: g.note || "",
      opened_at: openedAtDate,
      opened_by_name: p.name,
      opened_by_phone: p.phone,
      created_date: createdIso,
      updated_date: updatedIso,
    };
  });

  // ---------- היסטוריית שינויים (GapChange) ----------
  const GapChange = [];
  Gap.forEach((g, i) => {
    GapChange.push({
      id: `gapchange-create-${i + 1}`,
      gap_id: g.id,
      change_type: "create",
      field: "",
      field_label: "",
      old_value: "",
      new_value: "",
      changed_by: g.opened_by_name,
      created_date: g.created_date,
      updated_date: g.created_date,
    });
    if (g.status === "טופל") {
      GapChange.push({
        id: `gapchange-resolve-${i + 1}`,
        gap_id: g.id,
        change_type: "update",
        field: "status",
        field_label: "סטטוס",
        old_value: "בטיפול",
        new_value: "טופל",
        changed_by: person(i + 3).name,
        created_date: g.updated_date,
        updated_date: g.updated_date,
      });
    }
  });
  // עוד דוגמה לעדכון עדיפות, כדי שהיסטוריית השינויים תיראה מגוונת
  GapChange.push({
    id: "gapchange-priority-1",
    gap_id: Gap[1].id,
    change_type: "update",
    field: "priority",
    field_label: "עדיפות",
    old_value: "גבוה",
    new_value: "קריטי",
    changed_by: person(2).name,
    created_date: isoOffset(1, 12, 0),
    updated_date: isoOffset(1, 12, 0),
  });

  // ---------- עדכונים חופשיים (GapUpdate) ----------
  const GapUpdate = [
    { gap_id: Gap[1].id, message: "התקשרתי לחשמלאי, אמור להגיע היום אחר הצהריים", daysAgo: 1 },
    { gap_id: Gap[1].id, message: "החשמלאי הגיע, מחכים לחלק חילוף", daysAgo: 0 },
    { gap_id: Gap[4].id, message: "נבדק ע\"י הנגר, יתוקן בסוף השבוע", daysAgo: 2 },
    { gap_id: Gap[8].id, message: "הוזמן זכוכית חדשה למידה", daysAgo: 1 },
    { gap_id: Gap[13].id, message: "פנינו לקבלן הגדרות, ממתינים לתיאום מועד", daysAgo: 1 },
  ].map((u, i) => ({
    id: `gapupdate-${i + 1}`,
    gap_id: u.gap_id,
    message: u.message,
    created_by: person(i + 1).name,
    created_date: isoOffset(u.daysAgo, 10 + i, 15),
    updated_date: isoOffset(u.daysAgo, 10 + i, 15),
  }));

  // ---------- אילוצי פלוגות (Constraint) ----------
  const constraintDefs = [
    { pluga: "פארן", day: 0, start_time: "08:00", end_time: "10:00", title: "מסדר בוקר מורחב" },
    { pluga: "בשור", day: 1, start_time: "14:00", end_time: "16:00", title: "אימון כושר פלוגתי" },
    { pluga: "צין", day: 1, start_time: "20:00", end_time: "22:00", title: "משמרת שמירה" },
    { pluga: "רמון", day: 2, start_time: "09:00", end_time: "12:00", title: "יום שדה", details: "יציאה מוקדמת, חזרה בצהריים" },
    { pluga: "תמר", day: 3, start_time: "06:00", end_time: "08:00", title: "תורנות מטבח" },
    { pluga: "פארן", day: 3, start_time: "16:00", end_time: "18:00", title: "חוגי העשרה" },
    { pluga: "בשור", day: 4, start_time: "10:00", end_time: "13:00", title: "מסלול סיירות" },
    { pluga: "צין", day: 5, start_time: "08:00", end_time: "09:00", title: "בדיקת נשק" },
    { pluga: "רמון", day: 5, start_time: "19:00", end_time: "21:00", title: "פעילות גיבוש" },
    { pluga: "תמר", day: 6, start_time: "08:00", end_time: "10:00", title: "ניקיון שבועי" },
  ];
  const Constraint = constraintDefs.map((c, i) => ({
    id: `constraint-${i + 1}`,
    pluga: c.pluga,
    constraint_date: weekDateStr(c.day, 0),
    start_time: c.start_time,
    end_time: c.end_time,
    title: c.title,
    details: c.details || "",
    created_date: isoOffset(7, 9, 0),
    updated_date: isoOffset(7, 9, 0),
  }));

  // ---------- אירועים (Event) ----------
  const eventDefs = [
    { event_type: "חיצוני", day: 2, start_time: "07:00", end_time: "19:00", title: "יציאה לחופשה", transport_pluga: "פארן", transport_details: "אוטובוסים יוצאים מהשער הראשי", food_pluga: "בשור", food_details: "ארוחות צהריים ארוזות" },
    { event_type: "פנימי", day: 4, start_time: "18:00", end_time: "20:00", title: "ערב גיבוש פלוגתי", responsible_plugas: ["צין", "רמון"] },
    { event_type: "חיצוני", day: 6, start_time: "08:00", end_time: "20:00", title: "יום כיף לחיילים", transport_pluga: "תמר", food_pluga: "פארן" },
    { event_type: "פנימי", day: 1, weekOffset: 1, start_time: "17:00", end_time: "19:00", title: "טקס סיום קורס", responsible_plugas: ["בשור", "תמר", "צין"] },
  ];
  const Event = eventDefs.map((e, i) => ({
    id: `event-${i + 1}`,
    event_type: e.event_type,
    event_date: weekDateStr(e.day, e.weekOffset || 0),
    start_time: e.start_time,
    end_time: e.end_time,
    title: e.title,
    details: e.details || "",
    transport_pluga: e.transport_pluga || "",
    transport_details: e.transport_details || "",
    food_pluga: e.food_pluga || "",
    food_details: e.food_details || "",
    responsible_plugas: e.responsible_plugas || [],
    created_date: isoOffset(6, 9, 0),
    updated_date: isoOffset(6, 9, 0),
  }));

  // ---------- שוטף יומי (DailyRoutine) ----------
  const DailyRoutine = [
    {
      id: "dailyroutine-1",
      routine_date: dateOffset(0),
      morning_assembly_plugas: ["פארן", "רמון"],
      frisa_morning: "בשור",
      noon_cleaning: "צין",
      evening_cleaning: "תמר",
      created_date: isoOffset(0, 7, 0),
      updated_date: isoOffset(0, 13, 0),
    },
    {
      id: "dailyroutine-2",
      routine_date: dateOffset(1),
      morning_assembly_plugas: ["תמר"],
      frisa_morning: "פארן",
      noon_cleaning: "טרם הוחלט",
      evening_cleaning: "רמון",
      created_date: isoOffset(1, 7, 0),
      updated_date: isoOffset(1, 18, 0),
    },
  ];

  // ---------- סיכומי מסדר (DailySummary) ----------
  const DailySummary = [
    {
      id: "dailysummary-1",
      summary_date: dateOffset(0),
      entries: [
        { area: "מגורי בנים", pluga: "פארן", building: "3", room_number: "12", notes: "הכל תקין, בוצע ניקיון יסודי" },
        { area: "כיתות", pluga: "צין", building: "1", room_number: "", notes: "יש להחליף נורה בכיתה 4" },
        { area: "פינת פריסה", pluga: "בשור", building: "", room_number: "", notes: "פונתה אשפה, הכל נקי" },
      ],
      created_date: isoOffset(0, 20, 30),
      updated_date: isoOffset(0, 20, 30),
    },
    {
      id: "dailysummary-2",
      summary_date: dateOffset(1),
      entries: [
        { area: "מגורי בנות", pluga: "תמר", building: "2", room_number: "7", notes: "דלת ארון תוקנה" },
        { area: "שבילים מקיפי מתחם קמנים", pluga: "רמון", building: "", room_number: "", notes: "נוקה שביל מזבל שהצטבר" },
      ],
      created_date: isoOffset(1, 20, 45),
      updated_date: isoOffset(1, 20, 45),
    },
    {
      id: "dailysummary-3",
      summary_date: dateOffset(2),
      entries: [
        { area: "מגורי בנים", pluga: "בשור", building: "5", room_number: "20", notes: "בדיקת חלונות בוצעה" },
        { area: "פינת קקס", pluga: "צין", building: "", room_number: "", notes: "ברז תוקן" },
        { area: "כיתות", pluga: "פארן", building: "2", room_number: "3", notes: "" },
      ],
      created_date: isoOffset(2, 21, 0),
      updated_date: isoOffset(2, 21, 0),
    },
  ];

  // ---------- בקשות גישה (AccessRequest) — כדי שגם פאנל הניהול יראה נתוני דוגמה ----------
  const AccessRequest = [
    { id: "accessrequest-1", email: "roi.shimoni@example.com", full_name: "רועי שמעוני", status: "pending", assigned_role: "", created_date: isoOffset(2, 9, 0), updated_date: isoOffset(2, 9, 0) },
    { id: "accessrequest-2", email: "tal.avitan@example.com", full_name: "טל אביטן", status: "pending", assigned_role: "", created_date: isoOffset(1, 11, 0), updated_date: isoOffset(1, 11, 0) },
  ];

  // ---------- משתמשים (User) — כדי שפאנל הניהול יוכל להציג/לערוך משתמשים ----------
  const User = [
    { id: "mock-user-1", full_name: "משתמש בדיקה", email: "test@kalag.local", role: "admin", pluga: "", equipment_manager: true, created_date: isoOffset(60, 8, 0), updated_date: isoOffset(60, 8, 0) },
    { id: "mock-user-2", full_name: "יוסי כהן", email: "yossi.cohen@kalag.local", role: "קלפ", pluga: "פארן", equipment_manager: true, created_date: isoOffset(45, 8, 0), updated_date: isoOffset(45, 8, 0) },
    { id: "mock-user-3", full_name: "דנה לוי", email: "dana.levi@kalag.local", role: "רסר", pluga: "בשור", equipment_manager: false, created_date: isoOffset(30, 8, 0), updated_date: isoOffset(30, 8, 0) },
    { id: "mock-user-4", full_name: "אורי פרץ", email: "ori.peretz@kalag.local", role: "סגל", pluga: "צין", equipment_manager: false, created_date: isoOffset(20, 8, 0), updated_date: isoOffset(20, 8, 0) },
  ];

  // ---------- ציוד במחסנים (WarehouseItem) — מלאי זמין למשיכה בכל אחד משלושת המחסנים ----------
  const warehouseItemDefs = [
    { warehouse: "מכולה", name: "שמיכות", quantity: 40, returnable: true },
    { warehouse: "מכולה", name: "מזרנים", quantity: 25, returnable: true },
    { warehouse: "מכולה", name: "כריות", quantity: 30, returnable: true },
    { warehouse: "מכולה", name: "נורות חילוף", quantity: 100, returnable: false },
    { warehouse: "מכולה", name: "סוללות AA", quantity: 200, returnable: false },
    { warehouse: "מחסן קרביץ", name: "אפודי מגן", quantity: 20, returnable: true },
    { warehouse: "מחסן קרביץ", name: "קסדות", quantity: 20, returnable: true },
    { warehouse: "מחסן קרביץ", name: "פנסי ראש", quantity: 25, returnable: true },
    { warehouse: "מחסן קרביץ", name: "חבלים", quantity: 15, returnable: false },
    { warehouse: "מחסן לוגיסטי", name: "שולחנות מתקפלים", quantity: 12, returnable: true },
    { warehouse: "מחסן לוגיסטי", name: "כיסאות מתקפלים", quantity: 50, returnable: true },
    { warehouse: "מחסן לוגיסטי", name: "אוהלים", quantity: 6, returnable: true },
    { warehouse: "מחסן לוגיסטי", name: "גנרטור נייד", quantity: 3, returnable: true },
    { warehouse: "מחסן לוגיסטי", name: "כבלי הארכה", quantity: 25, returnable: false },
  ];
  const WarehouseItem = warehouseItemDefs.map((w, i) => ({
    id: `warehouseitem-${i + 1}`,
    warehouse: w.warehouse,
    name: w.name,
    quantity: w.quantity,
    returnable: w.returnable,
    created_date: isoOffset(40, 8, 0),
    updated_date: isoOffset(40, 8, 0),
  }));

  // ---------- היסטוריית בקשות משיכה (WithdrawalRequest) ----------
  const withdrawalDefs = [
    { warehouse: "מחסן קרביץ", pluga: "פארן", items: [{ name: "אפודי מגן", quantity: 5, returnable: true }], daysAgo: 10, returnDaysAgo: -5 },
    { warehouse: "מחסן לוגיסטי", pluga: "רמון", items: [{ name: "שולחנות מתקפלים", quantity: 4, returnable: true }, { name: "כיסאות מתקפלים", quantity: 20, returnable: true }], daysAgo: 5, returnDaysAgo: -3 },
    { warehouse: "מחסן לוגיסטי", pluga: "תמר", items: [{ name: "אוהלים", quantity: 2, returnable: true }], daysAgo: 15, returnDaysAgo: 2, notes: "לטיול פלוגתי" },
    { warehouse: "מכולה", pluga: "בשור", items: [{ name: "שמיכות", quantity: 10, returnable: true }], daysAgo: 3, returnDaysAgo: -10 },
    { warehouse: "מכולה", pluga: "צין", items: [{ name: "נורות חילוף", quantity: 15, returnable: false }, { name: "סוללות AA", quantity: 30, returnable: false }], daysAgo: 7 },
    { warehouse: "מחסן קרביץ", pluga: "רמון", items: [{ name: "חבלים", quantity: 8, returnable: false }], daysAgo: 12 },
  ];
  const WithdrawalRequest = withdrawalDefs.map((w, i) => {
    const p = person(i + 2);
    return {
      id: `withdrawal-${i + 1}`,
      warehouse: w.warehouse,
      items: w.items.map((it) => ({ name: it.name, quantity: it.quantity, returnable: it.returnable })),
      requested_by_name: p.name,
      pluga: w.pluga,
      request_date: dateOffset(w.daysAgo),
      expected_return_date: w.returnDaysAgo != null ? dateOffset(w.returnDaysAgo) : "",
      notes: w.notes || "",
      created_date: isoOffset(w.daysAgo, 10, 0),
      updated_date: isoOffset(w.daysAgo, 10, 0),
    };
  });

  // ---------- ציוד מוחזק כרגע ע״י פלוגות (EquipmentHolding) — פריטים "להחזרה" שטרם הוחזרו ----------
  // (מתאים לבקשות ה-withdrawal הראשונות ברשימה, שכוללות פריטים לצוד להחזרה)
  const holdingDefs = [
    { item_name: "אפודי מגן", warehouse: "מחסן קרביץ", quantity: 5, pluga: "פארן", daysAgo: 10, returnDaysAgo: -5 },
    { item_name: "שולחנות מתקפלים", warehouse: "מחסן לוגיסטי", quantity: 4, pluga: "רמון", daysAgo: 5, returnDaysAgo: -3 },
    { item_name: "כיסאות מתקפלים", warehouse: "מחסן לוגיסטי", quantity: 20, pluga: "רמון", daysAgo: 5, returnDaysAgo: -3 },
    // הפריט הבא כבר עבר את תאריך ההחזרה הצפוי — לדוגמה של ציוד "באיחור"
    { item_name: "אוהלים", warehouse: "מחסן לוגיסטי", quantity: 2, pluga: "תמר", daysAgo: 15, returnDaysAgo: 2 },
    { item_name: "שמיכות", warehouse: "מכולה", quantity: 10, pluga: "בשור", daysAgo: 3, returnDaysAgo: -10 },
  ];
  const EquipmentHolding = holdingDefs.map((h, i) => {
    const p = person(i + 2);
    return {
      id: `equipmentholding-${i + 1}`,
      item_name: h.item_name,
      warehouse: h.warehouse,
      quantity: h.quantity,
      pluga: h.pluga,
      held_by_name: p.name,
      withdrawal_date: dateOffset(h.daysAgo),
      expected_return_date: dateOffset(h.returnDaysAgo),
      created_date: isoOffset(h.daysAgo, 10, 0),
      updated_date: isoOffset(h.daysAgo, 10, 0),
    };
  });

  // ---------- הגדרות ציוד (EquipmentSettings) — רשומה יחידה עם אחראי הקלף ורשימת תפוצה ----------
  const EquipmentSettings = [
    {
      id: "equipmentsettings-1",
      responsible_klaf_id: "mock-user-2",
      responsible_klaf_name: "יוסי כהן",
      notification_emails: [],
      created_date: isoOffset(40, 8, 0),
      updated_date: isoOffset(40, 8, 0),
    },
  ];

  // ---------- משימות ישירות (DirectTask) ----------
  const directTaskDefs = [
    { title: "בדיקת מטפי כיבוי אש", pluga: "פארן", day: 0, start: "09:00", end: "10:00", status: "פתוחה" },
    { title: "ניקוי מחסן ציוד", pluga: "בשור", day: -2, start: "13:00", end: "15:00", status: "טופלה" },
    { title: "סיור ביטחוני משותף", responsible_plugas: ["צין", "רמון"], day: 1, start: "20:00", end: "22:00", status: "פתוחה" },
    { title: "ספירת מלאי במחסן הלוגיסטי", pluga: "תמר", day: -5, start: "10:00", end: "12:00", status: "טופלה" },
    { title: "תדרוך בטיחות אש", responsible_plugas: ["פארן", "בשור", "צין"], day: 2, start: "16:00", end: "17:00", status: "פתוחה" },
    { title: "תחזוקת גנרטור", pluga: "רמון", day: -1, start: "08:00", end: "09:00", status: "טופלה" },
  ];
  const DirectTask = directTaskDefs.map((t, i) => ({
    id: `directtask-${i + 1}`,
    title: t.title,
    pluga: t.pluga || "",
    responsible_plugas: t.responsible_plugas || [],
    task_date: dateOffset(-t.day),
    start_time: t.start,
    end_time: t.end,
    status: t.status,
    notes: "",
    created_date: isoOffset(-t.day + 1, 8, 0),
    updated_date: isoOffset(t.status === "טופלה" ? -t.day : -t.day + 1, 14, 0),
  }));

  // ---------- השלמות משימות שוטפות (TaskCompletion) — עבור ציר הזמן והדוחות בעמוד הסטטיסטיקה ----------
  const taskCompletionDefs = [
    { task_type: "event", task_id: "event-1", task_label: "יציאה לחופשה", pluga: "פארן", day: 2 },
    { task_type: "event", task_id: "event-2", task_label: "ערב גיבוש פלוגתי", pluga: "צין", day: 4 },
    { task_type: "shotaf", task_id: "shotaf-frisa_morning", task_field: "frisa_morning", task_label: "משיכת פינת פריסה", pluga: "בשור", day: 0 },
    { task_type: "shotaf", task_id: "shotaf-noon_cleaning", task_field: "noon_cleaning", task_label: "ניקוי צהריים", pluga: "צין", day: 0 },
    { task_type: "shotaf", task_id: "shotaf-evening_cleaning", task_field: "evening_cleaning", task_label: "ניקוי ערב", pluga: "תמר", day: 1 },
  ];
  const TaskCompletion = taskCompletionDefs.map((t, i) => ({
    id: `taskcompletion-${i + 1}`,
    task_type: t.task_type,
    task_id: t.task_id,
    task_field: t.task_field || "",
    task_label: t.task_label,
    task_date: weekDateStr(t.day, 0),
    pluga: t.pluga,
    created_date: isoOffset(6 - t.day, 18, 0),
    updated_date: isoOffset(6 - t.day, 18, 0),
  }));

  // ---------- אירועים חוזרים (RecurringEvent) ----------
  const RecurringEvent = [
    { id: "recurringevent-1", title: "תדריך בוקר", start_time: "07:30", end_time: "08:00", recurrence: "daily", pluga: "", details: "תדריך יומי קצר לכלל הפלוגות", created_date: isoOffset(50, 8, 0), updated_date: isoOffset(50, 8, 0) },
    { id: "recurringevent-2", title: "מסדר סוף שבוע", start_time: "16:00", end_time: "17:00", recurrence: "friday", pluga: "", details: "", created_date: isoOffset(50, 8, 0), updated_date: isoOffset(50, 8, 0) },
  ];

  // ---------- חריגים לאירועים חוזרים (RecurringOverride) ----------
  const RecurringOverride = [];

  return {
    Gap, GapChange, GapUpdate, Constraint, Event, DailyRoutine, DailySummary, AccessRequest,
    User, WarehouseItem, WithdrawalRequest, EquipmentHolding, EquipmentSettings,
    DirectTask, TaskCompletion, RecurringEvent, RecurringOverride,
  };
}

// משתמש הבדיקה המחובר אוטומטית במצב בדיקה — role: admin כדי לראות את כל האפליקציה כולל פאנל הניהול
export const MOCK_USER = {
  id: "mock-user-1",
  full_name: "משתמש בדיקה",
  email: "test@kalag.local",
  role: "admin",
};

// לשימוש פנימי בלבד (בדיקות/דיבוג עתידי)
export const MOCK_PLUGOT = PLUGOT;
export const MOCK_DORM_LOCATIONS = DORM_LOCATIONS;
