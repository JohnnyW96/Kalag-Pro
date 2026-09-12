import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLUGOT, LOCATIONS, DORM_LOCATIONS, PLUGA_COLORS, toDateStr } from "@/lib/constants";
import { STATUSES, PRIORITIES, STATUS_DOT, PRIORITY_DOT } from "@/components/gaps/gapHelpers";
import { cn } from "@/lib/utils";

function Dot({ className }) {
  return <span className={cn("inline-block w-2.5 h-2.5 rounded-full shrink-0", className)} />;
}

const EMPTY_FORM = {
  company: "",
  gap: "",
  location: "",
  building: "",
  room_number: "",
  status: "טרם הועלה",
  priority: "בינוני",
  opened_at: "",
  opened_by_name: "",
  opened_by_phone: "",
  note: "",
};

export default function GapForm({ open, onClose, onSubmit, editing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setForm({
        company: editing.company || "",
        gap: editing.gap || "",
        location: editing.location || "",
        building: editing.building || "",
        room_number: editing.room_number || "",
        status: editing.status || "טרם הועלה",
        priority: editing.priority || "בינוני",
        opened_at: editing.opened_at || toDateStr(new Date()),
        opened_by_name: editing.opened_by_name || "",
        opened_by_phone: editing.opened_by_phone || "",
        note: editing.note || "",
      });
    } else {
      setForm({ ...EMPTY_FORM, opened_at: toDateStr(new Date()) });
    }
  }, [editing, open]);

  const showBuildingFields = DORM_LOCATIONS.includes(form.location);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};
    if (!form.company) next.company = true;
    if (!form.gap.trim()) next.gap = true;
    if (!form.opened_by_name.trim()) next.opened_by_name = true;
    if (!form.opened_by_phone.trim()) next.opened_by_phone = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const errClass = (field) => (errors[field] ? "border-red-500 ring-1 ring-red-400" : "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "עריכת פער" : "הוספת פער חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>פלוגה *</Label>
            <Select value={form.company} onValueChange={(v) => setField("company", v)}>
              <SelectTrigger className={errClass("company")}><SelectValue placeholder="בחר פלוגה" /></SelectTrigger>
              <SelectContent>
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

          <div className="space-y-2">
            <Label>תיאור הפער *</Label>
            <Textarea
              value={form.gap}
              onChange={(e) => setField("gap", e.target.value)}
              placeholder="תיאור הליקוי או המשימה"
              rows={3}
              className={errClass("gap")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מיקום</Label>
              <Select value={form.location} onValueChange={(v) => setField("location", v)}>
                <SelectTrigger><SelectValue placeholder="בחר מיקום" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>תאריך פתיחה</Label>
              <Input
                type="date"
                value={form.opened_at}
                onChange={(e) => setField("opened_at", e.target.value)}
              />
            </div>
          </div>

          {showBuildingFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>מבנה</Label>
                <Input
                  value={form.building}
                  onChange={(e) => setField("building", e.target.value)}
                  placeholder="לדוגמה: מבנה 3"
                />
              </div>
              <div className="space-y-2">
                <Label>מספר חדר</Label>
                <Input
                  value={form.room_number}
                  onChange={(e) => setField("room_number", e.target.value)}
                  placeholder="לדוגמה: 12"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם הפותח *</Label>
              <Input
                value={form.opened_by_name}
                onChange={(e) => setField("opened_by_name", e.target.value)}
                placeholder="לדוגמה: ישראל ישראלי"
                className={errClass("opened_by_name")}
              />
            </div>
            <div className="space-y-2">
              <Label>טלפון הפותח *</Label>
              <Input
                type="tel"
                dir="ltr"
                value={form.opened_by_phone}
                onChange={(e) => setField("opened_by_phone", e.target.value)}
                placeholder="050-1234567"
                className={errClass("opened_by_phone")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <Dot className={STATUS_DOT[s]} />
                        {s}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>עדיפות חשיבות</Label>
              <Select value={form.priority} onValueChange={(v) => setField("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2">
                        <Dot className={PRIORITY_DOT[p]} />
                        {p}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              placeholder="הערות נוספות"
              rows={2}
            />
          </div>

          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-red-600">יש למלא את כל שדות החובה המסומנים באדום.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              ביטול
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "שומר..." : editing ? "שמור שינויים" : "הוסף פער"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
