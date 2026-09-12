import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Clock, CalendarPlus, Phone, Wrench, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLUGA_COLORS } from "@/lib/constants";
import {
  STATUS_STYLES,
  PRIORITY_STYLES,
  STATUS_DOT,
  PRIORITY_DOT,
  daysSince,
  formatShortDate,
  formatDateTime,
} from "@/components/gaps/gapHelpers";
import GapDetailsModal from "@/components/gaps/GapDetailsModal";

export default function GapCard({ gap, onEdit, onDelete, onStatusChange, staleDays = 7, latestUpdate, currentUser }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
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
          <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", STATUS_STYLES[gap.status])}>
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[gap.status])} />
            {gap.status}
          </span>
          <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", PRIORITY_STYLES[gap.priority])}>
            <span className={cn("w-2 h-2 rounded-full", PRIORITY_DOT[gap.priority])} />
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
          <Button size="icon" variant="ghost" onClick={() => setDetailsOpen(true)} className="h-8 w-8" title="פרטים והיסטוריית שינויים">
            <History className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onEdit(gap)} className="h-8 w-8" title="עריכת הפער">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(gap)} className="h-8 w-8 text-destructive hover:text-destructive" title="מחיקת הפער">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground leading-relaxed">{gap.gap}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {gap.company && (
          <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full font-medium", PLUGA_COLORS[gap.company]?.light || "bg-muted")}>
            <span className={cn("w-2 h-2 rounded-full", PLUGA_COLORS[gap.company]?.dot)} />
            {gap.company}
          </span>
        )}
        {gap.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {gap.location}
            {(gap.building || gap.room_number) && (
              <span>
                {" "}({gap.building}{gap.building && gap.room_number ? " / " : ""}{gap.room_number ? `חדר ${gap.room_number}` : ""})
              </span>
            )}
          </span>
        )}
        {gap.opened_at && (
          <span className="flex items-center gap-1">
            <CalendarPlus className="w-3.5 h-3.5" />
            נפתח {formatShortDate(gap.opened_at)}
          </span>
        )}
        {gap.updated_date && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            עודכן {formatDateTime(gap.updated_date)}
          </span>
        )}
      </div>

      {(gap.opened_by_name || gap.opened_by_phone) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {gap.opened_by_name && <span>נפתח ע״י: {gap.opened_by_name}</span>}
          {gap.opened_by_phone && (
            <a
              href={`tel:${gap.opened_by_phone}`}
              className="flex items-center gap-1 text-sky-700 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3.5 h-3.5" />
              {gap.opened_by_phone}
            </a>
          )}
        </div>
      )}

      {gap.note && (
        <p className="text-xs text-muted-foreground bg-muted/60 rounded-md p-2 leading-relaxed">{gap.note}</p>
      )}

      {latestUpdate && (
        <button
          onClick={() => setDetailsOpen(true)}
          className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2 text-right hover:bg-slate-100 transition-colors"
        >
          <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{latestUpdate.message}</span>
        </button>
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

      <GapDetailsModal
        gap={gap}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        currentUser={currentUser}
      />
    </Card>
  );
}

export { PRIORITY_RANK, daysSince } from "@/components/gaps/gapHelpers";
