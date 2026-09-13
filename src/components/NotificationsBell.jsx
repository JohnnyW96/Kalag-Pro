import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Repeat, Loader2, Inbox, Check, CheckCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { base44 } from "@/api/base44Client";
import { formatDateTime } from "@/components/gaps/gapHelpers";
import { cn } from "@/lib/utils";

const READ_IDS_KEY = "kalag_notifications_read_ids";
const INITIALIZED_KEY = "kalag_notifications_initialized";
const MAX_ITEMS = 30;

function getReadIds() {
  try {
    const raw = window.localStorage.getItem(READ_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadIds(idsSet) {
  try {
    window.localStorage.setItem(READ_IDS_KEY, JSON.stringify([...idsSet]));
  } catch {
    // ignore
  }
}

function isInitialized() {
  try {
    return window.localStorage.getItem(INITIALIZED_KEY) === "1";
  } catch {
    return false;
  }
}

function markInitialized() {
  try {
    window.localStorage.setItem(INITIALIZED_KEY, "1");
  } catch {
    // ignore
  }
}

// פעמון התראות: מציג עדכונים חופשיים חדשים ושינויי סטטוס שנעשו על פערים,
// עם סימון "נקרא" פר-פריט ואפשרות "סמן הכל כנקרא".
// מצב הקריאה נשמר מקומית במכשיר (localStorage) — אין צורך בישות/שרת נוסף בשביל זה.
export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [gapsById, setGapsById] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(getReadIds);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [gaps, updates, statusChanges] = await Promise.all([
        base44.entities.Gap.list("-created_date", 500),
        base44.entities.GapUpdate.list("-created_date", 100),
        base44.entities.GapChange.filter({ field: "status" }),
      ]);
      const byId = {};
      gaps.forEach((g) => { byId[g.id] = g; });
      setGapsById(byId);

      const updateItems = updates.map((u) => ({
        id: `gu-${u.id}`,
        type: "update",
        gapId: u.gap_id,
        actor: u.created_by,
        created_date: u.created_date,
        message: u.message,
      }));
      const statusItems = statusChanges.map((c) => ({
        id: `gc-${c.id}`,
        type: "status",
        gapId: c.gap_id,
        actor: c.changed_by,
        created_date: c.created_date,
        new_value: c.new_value,
      }));

      const merged = [...updateItems, ...statusItems]
        .filter((it) => it.created_date)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, MAX_ITEMS);
      setItems(merged);

      // בפעם הראשונה שהתכונה הזו רצה במכשיר — לא נציג "עשרות התראות" רטרואקטיביות
      // על היסטוריה קיימת, אלא נסמן אותה כנקראה ונתחיל למנות מכאן והלאה.
      if (!isInitialized()) {
        const allIds = new Set(merged.map((it) => it.id));
        persistReadIds(allIds);
        setReadIds(allIds);
        markInitialized();
      } else {
        // ניקוי שוטף: מזהים של פריטים שכבר לא ברשימה (יצאו מחלון ה-MAX_ITEMS) אין טעם לשמור לנצח
        setReadIds((prev) => {
          const validIds = new Set(merged.map((it) => it.id));
          const pruned = new Set([...prev].filter((id) => validIds.has(id)));
          if (pruned.size !== prev.size) persistReadIds(pruned);
          return pruned;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubGap = base44.entities.Gap.subscribe(() => load());
    const unsubUpdate = base44.entities.GapUpdate.subscribe(() => load());
    const unsubChange = base44.entities.GapChange.subscribe(() => load());
    return () => {
      unsubGap && unsubGap();
      unsubUpdate && unsubUpdate();
      unsubChange && unsubChange();
    };
  }, [load]);

  const unreadCount = useMemo(
    () => items.filter((it) => !readIds.has(it.id)).length,
    [items, readIds]
  );

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(() => {
      const next = new Set(items.map((it) => it.id));
      persistReadIds(next);
      return next;
    });
  }, [items]);

  const handleItemClick = (item) => {
    markRead(item.id);
    setOpen(false);
    navigate(`/?gap=${item.gapId}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="התראות"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto" dir="rtl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-right">התראות</SheetTitle>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-sky-700 hover:underline shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                סמן הכל כנקרא
              </button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">אין עדיין התראות</p>
              <p className="text-xs mt-1">עדכונים חופשיים ושינויי סטטוס על פערים יופיעו כאן</p>
            </div>
          ) : (
            items.map((item) => {
              const gap = gapsById[item.gapId];
              const isUnread = !readIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative rounded-lg border transition-colors",
                    isUnread ? "bg-sky-50 border-sky-200" : "bg-white border-slate-200"
                  )}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full text-right flex items-start gap-2.5 p-3 hover:bg-black/[0.02] rounded-lg transition-colors"
                  >
                    {item.type === "update" ? (
                      <MessageSquare className="w-4 h-4 mt-0.5 text-sky-600 shrink-0" />
                    ) : (
                      <Repeat className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 pl-6">
                      <p className="text-sm leading-relaxed">
                        {isUnread && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 ml-1.5 align-middle" />}
                        <span className="font-medium">{item.actor || "מישהו"}</span>
                        {item.type === "update" ? " הוסיף עדכון" : (
                          <>
                            {" "}שינה סטטוס ל<span className="font-medium">{item.new_value}</span>
                          </>
                        )}
                        {gap && (
                          <>
                            {" "}בפער "<span className="font-medium">{gap.gap}</span>"
                          </>
                        )}
                      </p>
                      {item.type === "update" && item.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">{formatDateTime(item.created_date)}</p>
                    </div>
                  </button>
                  {isUnread && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(item.id); }}
                      className="absolute top-2 left-2 p-1 rounded hover:bg-sky-100 text-sky-700"
                      title="סמן כנקרא"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
