import React, { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ChevronRight, ChevronLeft, CalendarRange } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLUGOT, PLUGA_COLORS, toDateStr, formatHebrewDate } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HOUR_START = 6;
const HOUR_END = 23;
const HOUR_HEIGHT = 40;

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeToPx(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  const hours = h + m / 60;
  const clamped = Math.max(HOUR_START, Math.min(HOUR_END, hours));
  return (clamped - HOUR_START) * HOUR_HEIGHT;
}

function getDateOnly(dateStr) {
  if (!dateStr) return "";
  return String(dateStr).split("T")[0];
}

export default function Constraints() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewConstraint, setViewConstraint] = useState(null);

  const [form, setForm] = useState({
    pluga: "",
    constraint_date: toDateStr(new Date()),
    start_time: "08:00",
    end_time: "10:00",
    title: "",
    details: "",
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const loadConstraints = useCallback(async () => {
    try {
      const data = await base44.entities.Constraint.list("-constraint_date", 500);
      setConstraints(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConstraints();
  }, [loadConstraints]);

  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pluga || !form.title || !form.start_time || !form.end_time) return;
    setSaving(true);
    try {
      await base44.entities.Constraint.create(form);
      setFormOpen(false);
      setForm({ pluga: "", constraint_date: toDateStr(new Date()), start_time: "08:00", end_time: "10:00", title: "", details: "" });
      await loadConstraints();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.Constraint.delete(id);
    await loadConstraints();
  };

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getWeekStart(new Date()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">אילוצי פלוגות</h1>
            <p className="text-xs text-muted-foreground">לוח זמנים שבועי</p>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          הוסף אילוץ
        </Button>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-border p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrevWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNextWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={goToday} className="text-sm">היום</Button>
        </div>
        <p className="text-sm font-medium">
          {days[0].getDate()}/{days[0].getMonth() + 1} - {days[6].getDate()}/{days[6].getMonth() + 1}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {PLUGOT.map((p) => (
          <div key={p} className="flex items-center gap-2 text-sm">
            <div className={cn("w-4 h-4 rounded", PLUGA_COLORS[p].bg)} />
            <span>{p}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-border">
          <div className="min-w-[700px]">
            <div className="flex border-b border-border bg-slate-50">
              <div className="w-14 shrink-0"></div>
              {days.map((d, i) => (
                <div key={i} className="flex-1 text-center py-2 border-l border-border last:border-l-0">
                  <p className="text-sm font-medium">{DAY_NAMES[d.getDay()]}</p>
                  <p className="text-xs text-muted-foreground">{d.getDate()}/{d.getMonth() + 1}</p>
                </div>
              ))}
            </div>
            <div className="flex">
              <div className="w-14 shrink-0">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="text-xs text-muted-foreground text-center pt-1 border-b border-border/50"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {h}:00
                  </div>
                ))}
              </div>
              {days.map((d, i) => {
                const dateStr = toDateStr(d);
                const dayConstraints = constraints.filter(
                  (c) => getDateOnly(c.constraint_date) === dateStr
                );
                return (
                  <div
                    key={i}
                    className="flex-1 relative border-l border-border last:border-l-0"
                    style={{ height: totalHeight }}
                  >
                    {hours.map((h, hi) => (
                      <div
                        key={hi}
                        className="absolute w-full border-b border-border/30"
                        style={{ top: hi * HOUR_HEIGHT }}
                      />
                    ))}
                    {dayConstraints.map((c) => {
                      const top = timeToPx(c.start_time);
                      const height = Math.max(timeToPx(c.end_time) - top, 20);
                      const colors = PLUGA_COLORS[c.pluga] || PLUGA_COLORS[PLUGOT[0]];
                      return (
                        <div
                          key={c.id}
                          onClick={() => setViewConstraint(c)}
                          className={cn(
                            "absolute rounded-md p-1.5 text-xs overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
                            colors.bg,
                            colors.text
                          )}
                          style={{ top, height, right: 1, left: 1 }}
                        >
                          <p className="font-semibold truncate">{c.title}</p>
                          <p className="opacity-80 text-[10px]">{c.start_time} - {c.end_time}</p>
                          {height > 50 && c.details && (
                            <p className="opacity-70 mt-1 line-clamp-2">{c.details}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="sm:max-w-[480px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת אילוץ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>פלוגה *</Label>
              <Select value={form.pluga} onValueChange={(v) => setForm({ ...form, pluga: v })}>
                <SelectTrigger><SelectValue placeholder="בחר פלוגה" /></SelectTrigger>
                <SelectContent>
                  {PLUGOT.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>תאריך *</Label>
              <Input
                type="date"
                value={form.constraint_date}
                onChange={(e) => setForm({ ...form, constraint_date: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שעת התחלה *</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>שעת סיום *</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="כותרת האילוץ (יופיע בלוח הזמנים)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>פירוט</Label>
              <Textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="פירוט נוסף (אופציונלי)"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
                ביטול
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "שומר..." : "הוסף אילוץ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewConstraint} onOpenChange={(o) => !o && setViewConstraint(null)}>
        <DialogContent className="sm:max-w-[420px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>פרטי אילוץ</DialogTitle>
          </DialogHeader>
          {viewConstraint && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded", (PLUGA_COLORS[viewConstraint.pluga] || {}).bg)} />
                <span className="font-medium">{viewConstraint.pluga}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">כותרת</p>
                <p className="font-semibold text-lg">{viewConstraint.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">תאריך</p>
                <p className="text-sm">{formatHebrewDate(viewConstraint.constraint_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">שעות</p>
                <p className="text-sm">{viewConstraint.start_time} - {viewConstraint.end_time}</p>
              </div>
              {viewConstraint.details && (
                <div>
                  <p className="text-xs text-muted-foreground">פירוט</p>
                  <p className="text-sm whitespace-pre-wrap">{viewConstraint.details}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewConstraint(null)}>סגור</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (viewConstraint) {
                  handleDelete(viewConstraint.id);
                  setViewConstraint(null);
                }
              }}
            >
              מחק אילוץ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}