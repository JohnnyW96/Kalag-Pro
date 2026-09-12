import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { PLUGOT, LOCATIONS, PLUGA_COLORS } from "@/lib/constants";
import { PRIORITIES, PRIORITY_STYLES } from "@/components/gaps/gapHelpers";
import { cn } from "@/lib/utils";

function round1(n) {
  return Math.round(n * 10) / 10;
}

function BarList({ items }) {
  if (!items.length) {
    return <div className="text-xs text-muted-foreground py-4 text-center">אין נתונים</div>;
  }
  const max = Math.max(...items.map((it) => it.count), 1);
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 text-xs">
          <div className="w-24 shrink-0 truncate flex items-center gap-1.5">
            {it.dotClass && <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", it.dotClass)} />}
            <span className="truncate">{it.label}</span>
          </div>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", it.barClass || "bg-slate-400")}
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
          <div className="w-6 text-left font-medium">{it.count}</div>
        </div>
      ))}
    </div>
  );
}

export default function GapStats({ gaps }) {
  const [resolveStats, setResolveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadResolveStats() {
      setLoading(true);
      try {
        const closedChanges = await base44.entities.GapChange.filter({ field: "status", new_value: "טופל" });
        if (cancelled) return;
        const sorted = [...closedChanges].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const closedAt = {};
        sorted.forEach((c) => { closedAt[c.gap_id] = c.created_date; });

        const durations = [];
        const byPriority = {};
        PRIORITIES.forEach((p) => { byPriority[p] = { sum: 0, count: 0 }; });

        gaps.forEach((g) => {
          if (g.status !== "טופל") return;
          const closedDate = closedAt[g.id];
          if (!closedDate) return;
          const opened = new Date((g.opened_at || g.created_date) + (g.opened_at ? "T00:00:00" : ""));
          const closed = new Date(closedDate);
          const days = (closed - opened) / 86400000;
          if (isNaN(days) || days < 0) return;
          durations.push(days);
          if (byPriority[g.priority]) {
            byPriority[g.priority].sum += days;
            byPriority[g.priority].count += 1;
          }
        });

        const byPriorityAvg = {};
        PRIORITIES.forEach((p) => {
          const b = byPriority[p];
          byPriorityAvg[p] = b.count ? { avg: round1(b.sum / b.count), count: b.count } : null;
        });

        setResolveStats({
          avg: durations.length ? round1(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
          count: durations.length,
          byPriority: byPriorityAvg,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadResolveStats();
    return () => { cancelled = true; };
  }, [gaps]);

  const byCompany = useMemo(() => PLUGOT.map((c) => ({
    label: c,
    count: gaps.filter((g) => g.company === c).length,
    dotClass: PLUGA_COLORS[c]?.dot,
    barClass: PLUGA_COLORS[c]?.bg,
  })), [gaps]);

  const byPriority = useMemo(() => PRIORITIES.map((p) => ({
    label: p,
    count: gaps.filter((g) => g.priority === p).length,
    barClass: PRIORITY_STYLES[p]?.includes("red") ? "bg-red-500" : PRIORITY_STYLES[p]?.includes("orange") ? "bg-orange-500" : PRIORITY_STYLES[p]?.includes("sky") ? "bg-sky-500" : "bg-slate-400",
  })), [gaps]);

  const byLocation = useMemo(() => LOCATIONS
    .map((l) => ({ label: l, count: gaps.filter((g) => g.location === l).length }))
    .filter((it) => it.count > 0)
    .sort((a, b) => b.count - a.count), [gaps]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-semibold">פערים לפי פלוגה</h3>
        <BarList items={byCompany} />
      </div>
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-semibold">פערים לפי עדיפות</h3>
        <BarList items={byPriority} />
      </div>
      <div className="bg-white rounded-xl border border-border p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-semibold">פערים לפי מיקום</h3>
        <BarList items={byLocation} />
      </div>
      <div className="bg-white rounded-xl border border-border p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-semibold">זמן פתרון ממוצע</h3>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : !resolveStats || !resolveStats.count ? (
          <p className="text-xs text-muted-foreground text-center py-4">אין עדיין מספיק פערים סגורים כדי לחשב ממוצע</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <StatTile num={resolveStats.avg} unit="ימים" cap={`ממוצע כללי (${resolveStats.count} פערים סגורים)`} />
            {PRIORITIES.map((p) => {
              const s = resolveStats.byPriority[p];
              if (!s || !s.count) return null;
              return <StatTile key={p} num={s.avg} unit="ימים" cap={`עדיפות ${p} (${s.count})`} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ num, unit, cap }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-w-[140px]">
      <div className="text-2xl font-bold">
        {num} <small className="text-sm font-normal text-muted-foreground">{unit}</small>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{cap}</div>
    </div>
  );
}
