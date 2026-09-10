import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLUGOT, LOCATIONS } from "@/lib/constants";

const STATUSES = ["טרם הועלה", "בטיפול", "טופל"];
const PRIORITIES = ["נמוך", "בינוני", "גבוה", "קריטי"];

export default function GapForm({ open, onClose, onSubmit, editing }) {
  const [form, setForm] = useState({
    company: "",
    gap: "",
    location: "",
    status: "טרם הועלה",
    priority: "בינוני",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        company: editing.company || "",
        gap: editing.gap || "",
        location: editing.location || "",
        status: editing.status || "טרם הועלה",
        priority: editing.priority || "בינוני",
        note: editing.note || "",
      });
    } else {
      setForm({
        company: "",
        gap: "",
        location: "",
        status: "טרם הועלה",
        priority: "בינוני",
        note: "",
      });
    }
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.gap.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "עריכת פער" : "הוספת פער חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>פלוגה *</Label>
            <Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}>
              <SelectTrigger><SelectValue placeholder="בחר פלוגה" /></SelectTrigger>
              <SelectContent>
                {PLUGOT.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>תיאור הפער *</Label>
            <Textarea
              value={form.gap}
              onChange={(e) => setForm({ ...form, gap: e.target.value })}
              placeholder="תיאור הליקוי או המשימה"
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מיקום</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger><SelectValue placeholder="בחר מיקום" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>עדיפות חשיבות</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="הערות נוספות"
              rows={2}
            />
          </div>
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