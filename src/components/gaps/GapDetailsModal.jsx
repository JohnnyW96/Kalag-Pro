import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Phone, MapPin, Building2, History, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STATUS_STYLES,
  PRIORITY_STYLES,
  GAP_FIELD_LABELS,
  formatDateTime,
  formatShortDate,
  currentUserLabel,
} from "@/components/gaps/gapHelpers";

export default function GapDetailsModal({ gap, open, onClose, currentUser }) {
  const [updates, setUpdates] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!gap?.id) return;
    setLoading(true);
    try {
      const [updatesData, changesData] = await Promise.all([
        base44.entities.GapUpdate.filter({ gap_id: gap.id }),
        base44.entities.GapChange.filter({ gap_id: gap.id }),
      ]);
      const sortByDateDesc = (a, b) => new Date(b.created_date) - new Date(a.created_date);
      setUpdates([...updatesData].sort(sortByDateDesc));
      setChanges([...changesData].sort(sortByDateDesc));
    } finally {
      setLoading(false);
    }
  }, [gap?.id]);

  useEffect(() => {
    if (!open) return;
    load();
    const unsubscribeUpdates = base44.entities.GapUpdate.subscribe(() => load());
    return unsubscribeUpdates;
  }, [open, load]);

  const handleAddUpdate = async () => {
    if (!newMessage.trim() || !gap?.id) return;
    setPosting(true);
    try {
      await base44.entities.GapUpdate.create({
        gap_id: gap.id,
        message: newMessage.trim(),
        created_by: currentUserLabel(currentUser),
      });
      setNewMessage("");
      await load();
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteUpdate = async (id) => {
    await base44.entities.GapUpdate.delete(id);
    await load();
  };

  if (!gap) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>פרטי הפער</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* פרטים */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", STATUS_STYLES[gap.status])}>
                {gap.status}
              </span>
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", PRIORITY_STYLES[gap.priority])}>
                {gap.priority}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{gap.gap}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{gap.company}</span>
              {gap.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {gap.location}
                  {(gap.building || gap.room_number) && ` (${gap.building || ""}${gap.building && gap.room_number ? " / " : ""}${gap.room_number ? `חדר ${gap.room_number}` : ""})`}
                </span>
              )}
              {gap.opened_at && <span>תאריך פתיחה: {formatShortDate(gap.opened_at)}</span>}
              {gap.opened_by_name && <span>נפתח ע״י: {gap.opened_by_name}</span>}
              {gap.opened_by_phone && (
                <a href={`tel:${gap.opened_by_phone}`} className="flex items-center gap-1 text-sky-700 hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  {gap.opened_by_phone}
                </a>
              )}
              {gap.updated_date && <span>עודכן לאחרונה: {formatDateTime(gap.updated_date)}</span>}
            </div>
            {gap.note && (
              <p className="text-xs text-muted-foreground bg-muted/60 rounded-md p-2 leading-relaxed">{gap.note}</p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* עדכונים חופשיים */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  עדכונים
                </h3>
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='לדוגמה: "הוזמן טכנאי, מגיע מחר"'
                    rows={2}
                    maxLength={300}
                    className="flex-1"
                  />
                </div>
                <Button size="sm" onClick={handleAddUpdate} disabled={posting || !newMessage.trim()}>
                  {posting ? "שולח..." : "הוסף עדכון"}
                </Button>
                <div className="space-y-2">
                  {updates.length === 0 ? (
                    <p className="text-xs text-muted-foreground">אין עדכונים עדיין.</p>
                  ) : (
                    updates.map((u) => (
                      <div key={u.id} className="flex items-start justify-between gap-2 bg-slate-50 border border-slate-200 rounded-md p-2">
                        <div>
                          <p className="text-sm">{u.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {formatDateTime(u.created_date)}{u.created_by ? ` · ${u.created_by}` : ""}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleDeleteUpdate(u.id)}
                          aria-label="מחיקת העדכון"
                          title="מחיקת העדכון"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Changelog */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  היסטוריית שינויים
                </h3>
                {changes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">אין עדיין היסטוריית שינויים.</p>
                ) : (
                  <div className="space-y-1.5">
                    {changes.map((c) => (
                      <div key={c.id} className="text-xs text-muted-foreground border-r-2 border-slate-200 pr-2">
                        {c.change_type === "create" ? (
                          <span>נוצר{c.changed_by ? ` על ידי ${c.changed_by}` : ""} — {formatDateTime(c.created_date)}</span>
                        ) : (
                          <span>
                            <span className="font-medium text-foreground">{c.field_label || GAP_FIELD_LABELS[c.field] || c.field}</span>
                            {": "}
                            {c.old_value || "—"} ← {c.new_value || "—"}
                            {c.changed_by ? ` · ${c.changed_by}` : ""}
                            {" · "}
                            {formatDateTime(c.created_date)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
