// חנות נתונים גנרית בזיכרון (מגובה ל-localStorage), שחושפת את אותו API בדיוק
// כמו ישות ב-base44 SDK: list / filter / create / update / delete / subscribe.
// כך שאר הקוד באפליקציה (Home.jsx, Shotaf.jsx וכו') לא צריך לדעת אם הוא מדבר
// עם base44 אמיתי או עם הדאטא המדומה של מצב הבדיקה.
import { MOCK_DB_KEY, SEED_VERSION } from "@/lib/mock/constants";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function matchesQuery(record, query) {
  return Object.keys(query || {}).every((key) => record[key] === query[key]);
}

// תומך בתחביר המיון של base44: "-created_date" = יורד, "created_date" = עולה
function applySort(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const sorted = [...rows].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return -1;
    if (bv == null) return 1;
    if (av > bv) return 1;
    if (av < bv) return -1;
    return 0;
  });
  return desc ? sorted.reverse() : sorted;
}

export class MockStore {
  constructor(buildSeed) {
    this.buildSeed = buildSeed;
    this.listeners = {};
    this.data = this._load();
  }

  _load() {
    try {
      const raw = window.localStorage.getItem(MOCK_DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.__seedVersion === SEED_VERSION) return parsed;
      }
    } catch {
      // אחסון פגום/לא זמין — נתעלם ונבנה סט חדש
    }
    return this._seedFresh();
  }

  _seedFresh() {
    const fresh = this.buildSeed();
    fresh.__seedVersion = SEED_VERSION;
    this._persist(fresh);
    return fresh;
  }

  _persist(data) {
    try {
      window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  reset() {
    this.data = this._seedFresh();
    Object.keys(this.listeners).forEach((name) => this._notify(name));
  }

  _notify(name) {
    const set = this.listeners[name];
    if (!set) return;
    set.forEach((cb) => {
      try {
        cb();
      } catch {
        // אל תפיל מנוי אחד בגלל תקלה במנוי אחר
      }
    });
  }

  entity(name) {
    if (!Array.isArray(this.data[name])) this.data[name] = [];
    const self = this;
    return {
      list: async (sort, limit) => {
        let rows = applySort(self.data[name], sort);
        if (limit) rows = rows.slice(0, limit);
        return clone(rows);
      },
      filter: async (query = {}, sort, limit) => {
        let rows = self.data[name].filter((r) => matchesQuery(r, query));
        rows = applySort(rows, sort);
        if (limit) rows = rows.slice(0, limit);
        return clone(rows);
      },
      create: async (fields) => {
        const now = new Date().toISOString();
        const record = { id: genId(name.toLowerCase()), created_date: now, updated_date: now, ...fields };
        self.data[name].push(record);
        self._persist(self.data);
        self._notify(name);
        return clone(record);
      },
      update: async (id, fields) => {
        const idx = self.data[name].findIndex((r) => r.id === id);
        if (idx === -1) throw new Error(`${name} עם המזהה ${id} לא נמצא (מצב בדיקה)`);
        const updated = { ...self.data[name][idx], ...fields, updated_date: new Date().toISOString() };
        self.data[name][idx] = updated;
        self._persist(self.data);
        self._notify(name);
        return clone(updated);
      },
      delete: async (id) => {
        self.data[name] = self.data[name].filter((r) => r.id !== id);
        self._persist(self.data);
        self._notify(name);
        return { success: true };
      },
      subscribe: (cb) => {
        if (!self.listeners[name]) self.listeners[name] = new Set();
        self.listeners[name].add(cb);
        return () => {
          self.listeners[name]?.delete(cb);
        };
      },
    };
  }
}
