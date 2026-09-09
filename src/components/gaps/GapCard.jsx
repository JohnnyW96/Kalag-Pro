import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Building2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  "טרם הועלה": "bg-amber-100 text-amber-800 border-amber-200",
  "בטיפול": "bg-blue-100 text-blue-800 border-blue-200",
  "טופל": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const PRIORITY_STYLES = {
  "נמוך": "bg-slate-100 text-slate-600",
  "בינוני": "bg-sky-100 text-sky-700",
  "גבוה": "bg-orange-100 text-orange-700",
  "קריטי": "bg-red-100 text-red-700 ring-1 ring-red-200",
};

const PRIORITY_RANK = { "קריטי": 4, "גבוה": 3, "בינוני": 2, "נמוך": 1 };

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function GapCard({ gap, onEdit, onDelete, onStatusChange, staleDays = 7 }) {
  const days = daysSince(gap.updated_date);
  const isStale = days != null && days >= staleDays && gap.status !== "טופל";

  return (
    <Card
      dir="rtl"
      className={cn(
        "p-4 flex flex-col gap-3 transition-all hover:shadow-md",
        isStale && "ring-2 ring-amber-300/70 bg-amber-50/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", STATUS_STYLES[gap.status])}>
            {gap.status}
          </span>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", PRIORITY_STYLES[gap.priority])}>
            {gap.priority}
          </span>
          {isStale && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              לא עודכן {days} ימים
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" onClick={() => onEdit(gap)} className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(gap)} className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground leading-relaxed">{gap.gap}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {gap.company && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {gap.company}
          </span>
        )}
        {gap.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {gap.location}
          </span>
        )}
      </div>

      {gap.note && (
        <p className="text-xs text-muted-foreground bg-muted/60 rounded-md p-2 leading-relaxed">{gap.note}</p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border/60">
        <span className="text-xs text-muted-foreground">שנה סטטוס:</span>
        {["טרם הועלה", "בטיפול", "טופל"].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(gap, s)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              gap.status === s
                ? STATUS_STYLES[s]
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}

export { PRIORITY_RANK, daysSince };