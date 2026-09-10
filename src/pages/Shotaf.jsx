import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sun, Sunset, Moon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLUGOT, PLUGA_COLORS, formatHebrewDate, toDateStr } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Shotaf() {
  const today = new Date();
  const todayStr = toDateStr(today);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const loadRoutine = useCallback(async () => {
    try {
      const data = await base44.entities.DailyRoutine.filter({ routine_date: todayStr });
      if (data.length > 0) {
        setRoutine(data[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const updateField = async (field, value) => {
    setSaving(field);
    try {
      if (!routine) {
        const created = await base44.entities.DailyRoutine.create({
          routine_date: todayStr,
          frisa_morning: "",
          noon_cleaning: "",
          evening_cleaning: "",
          [field]: value,
        });
        setRoutine(created);
      } else {
        const updated = await base44.entities.DailyRoutine.update(routine.id, { [field]: value });
        setRoutine(updated);
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const panels = [
    { field: "frisa_morning", label: "משיכת פינת פריסה", icon: Sun },
    { field: "noon_cleaning", label: "ניקוי צהריים - פינת פריסה ושירותים", icon: Sunset },
    { field: "evening_cleaning", label: "ניקוי ערב - פינת פריסה ושירותים", icon: Moon },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{formatHebrewDate(today)}</h1>
        <p className="text-sm text-muted-foreground mt-1">שוטף יומי</p>
      </div>

      <div className="space-y-4">
        {panels.map(({ field, label, icon: Icon }) => {
          const selectedPluga = routine?.[field];
          const plugaColor = selectedPluga ? PLUGA_COLORS[selectedPluga] : null;
          return (
            <div key={field} className={cn(
              "rounded-xl border-2 p-5 transition-colors",
              plugaColor ? `${plugaColor.light} ${plugaColor.border}` : "bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <h2 className="text-base font-semibold flex-1">{label}</h2>
                {saving === field && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <Select
                value={routine?.[field] || ""}
                onValueChange={(v) => updateField(field, v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="בחר פלוגה אחראית..." />
                </SelectTrigger>
                <SelectContent>
                  {PLUGOT.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}