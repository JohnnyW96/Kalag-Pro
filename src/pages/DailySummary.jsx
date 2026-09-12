import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, ClipboardList, FileText, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATIONS, DORM_LOCATIONS, PLUGOT, PLUGA_COLORS, formatHebrewDate, toDateStr } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Dot({ className }) {
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", className)} />;
}

function PlugaBadge({ pluga }) {
  if (!pluga) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium", PLUGA_COLORS[pluga]?.light || "bg-muted")}>
      <Dot className={PLUGA_COLORS[pluga]?.dot} />
      {pluga}
    </span>
  );
}

function buildingLabel(entry) {
  if (!entry.building && !entry.room_number) return "";
  return `${entry.building || ""}${entry.building && entry.room_number ? " / " : ""}${entry.room_number ? `חדר ${entry.room_number}` : ""}`;
}

function parseEntries(entries) {
  if (!entries) return [];
  if (Array.isArray(entries)) return entries;
  if (typeof entries === "string") {
    try { return JSON.parse(entries); } catch { return []; }
  }
  return [];
}

const EMPTY_ENTRY = { area: "", notes: "", pluga: "", building: "", room_number: "" };

export default function DailySummaryPage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [draft, setDraft] = useState(EMPTY_ENTRY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const showBuildingFields = DORM_LOCATIONS.includes(draft.area);

  const handleCopy = async (summary) => {
    const parsed = parseEntries(summary.entries);
    const dateStr = formatHebrewDate(summary.summary_date);
    let text = `סיכום מסדר - ${dateStr}\n\n`;
    parsed.forEach((e) => {
      const extras = [e.pluga, buildingLabel(e)].filter(Boolean).join(" · ");
      text += `${e.area}${extras ? ` (${extras})` : ""}:\n`;
      if (e.notes) text += `${e.notes}\n`;
      text += `\n`;
    });
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "הועתק ללוח", duration: 2000 });
    } catch (err) {
      toast({ title: "שגיאה בהעתקה", variant: "destructive" });
    }
  };

  const loadSummaries = useCallback(async () => {
    try {
      const data = await base44.entities.DailySummary.list("-summary_date", 100);
      setSummaries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const setDraftField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const addEntry = () => {
    if (!draft.area.trim()) return;
    setEntries([...entries, { ...draft }]);
    setDraft(EMPTY_ENTRY);
  };

  const removeEntry = (idx) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleFinish = async () => {
    if (entries.length === 0) return;
    setSaving(true);
    try {
      await base44.entities.DailySummary.create({
        summary_date: toDateStr(new Date()),
        entries: entries,
      });
      setEntries([]);
      setBuilderOpen(false);
      await loadSummaries();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">סיכום מסדר</h1>
            <p className="text-xs text-muted-foreground">סיכומי מסדר יומיים</p>
          </div>
        </div>
        <Button onClick={() => setBuilderOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          סיכום חדש
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">אין סיכומי מסדר</p>
          <p className="text-sm mt-1">לחץ "סיכום חדש" ליצירת סיכום.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => {
            const parsed = parseEntries(s.entries);
            return (
              <div key={s.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold">{formatHebrewDate(s.summary_date)}</h2>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCopy(s)} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    העתק
                  </Button>
                </div>
                <div className="space-y-2">
                  {parsed.map((e, i) => (
                    <div key={i} className="flex gap-3 text-sm border-r-2 border-slate-200 pr-3">
                      <div className="min-w-[140px] space-y-1">
                        <div className="font-medium">{e.area}</div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PlugaBadge pluga={e.pluga} />
                          {buildingLabel(e) && (
                            <span className="text-[11px] text-muted-foreground">{buildingLabel(e)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-muted-foreground whitespace-pre-wrap">{e.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={builderOpen} onOpenChange={(o) => !o && setBuilderOpen(false)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>סיכום מסדר - {formatHebrewDate(toDateStr(new Date()))}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>איזור</Label>
                  <Select value={draft.area} onValueChange={(v) => setDraftField("area", v)}>
                    <SelectTrigger><SelectValue placeholder="בחר איזור" /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>פלוגה רלוונטית</Label>
                  <Select value={draft.pluga || "none"} onValueChange={(v) => setDraftField("pluga", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="ללא" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא</SelectItem>
                      {PLUGOT.map((p) => (
                        <SelectItem key={p} value={p}>
                          <span className="flex items-center gap-2">
                            <Dot className={PLUGA_COLORS[p]?.dot} />
                            {p}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showBuildingFields && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>מבנה</Label>
                    <Input
                      value={draft.building}
                      onChange={(e) => setDraftField("building", e.target.value)}
                      placeholder="לדוגמה: מבנה 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר חדר</Label>
                    <Input
                      value={draft.room_number}
                      onChange={(e) => setDraftField("room_number", e.target.value)}
                      placeholder="לדוגמה: 12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>הערות</Label>
                <Textarea
                  value={draft.notes}
                  onChange={(e) => setDraftField("notes", e.target.value)}
                  placeholder="הערות לאיזור זה"
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addEntry}
                disabled={!draft.area.trim()}
                className="gap-2 w-full"
              >
                <Plus className="w-4 h-4" />
                הוסף לסיכום
              </Button>
            </div>

            {entries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">פריטים בסיכום ({entries.length}):</p>
                {entries.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 border rounded-lg p-3 bg-white">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium">{e.area}</p>
                        <PlugaBadge pluga={e.pluga} />
                        {buildingLabel(e) && (
                          <span className="text-[11px] text-muted-foreground">{buildingLabel(e)}</span>
                        )}
                      </div>
                      {e.notes && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{e.notes}</p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeEntry(i)}
                      className="h-8 w-8 text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setBuilderOpen(false); setEntries([]); setDraft(EMPTY_ENTRY); }}
              disabled={saving}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={handleFinish}
              disabled={saving || entries.length === 0}
            >
              {saving ? "שומר..." : "סיום ושמירה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
