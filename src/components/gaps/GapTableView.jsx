import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, History, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLUGA_COLORS } from "@/lib/constants";
import { STATUS_STYLES, PRIORITY_STYLES, formatShortDate, formatDateTime } from "@/components/gaps/gapHelpers";

const STATUS_CYCLE = ["טרם הועלה", "בטיפול", "טופל"];

const SORTABLE_COLUMNS = [
  { field: "status", label: "סטטוס" },
  { field: "priority", label: "עדיפות" },
  { field: "opened_at", label: "תאריך פתיחה" },
  { field: "updated_date", label: "עודכן לאחרונה" },
];

function SortHeader({ field, label, sortField, sortDir, onSort }) {
  const isActive = sortField === field;
  const Icon = isActive ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn("flex items-center gap-1 hover:text-foreground transition-colors", isActive && "text-foreground font-semibold")}
    >
      {label}
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export default function GapTableView({ gaps, sortField, sortDir, onSort, onEdit, onDelete, onStatusChange, onOpenDetails }) {
  const isSortable = (field) => SORTABLE_COLUMNS.some((c) => c.field === field);

  const header = (field, label) => (
    isSortable(field)
      ? <SortHeader field={field} label={label} sortField={sortField} sortDir={sortDir} onSort={onSort} />
      : label
  );

  const cycleStatus = (gap) => {
    const idx = STATUS_CYCLE.indexOf(gap.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onStatusChange(gap, next);
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>פלוגה</TableHead>
            <TableHead>פער</TableHead>
            <TableHead>מיקום</TableHead>
            <TableHead>{header("status", "סטטוס")}</TableHead>
            <TableHead>{header("priority", "עדיפות")}</TableHead>
            <TableHead>{header("opened_at", "תאריך פתיחה")}</TableHead>
            <TableHead>{header("updated_date", "עודכן לאחרונה")}</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gaps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-10">אין פערים להצגה</TableCell>
            </TableRow>
          ) : (
            gaps.map((gap, i) => (
              <TableRow key={gap.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", PLUGA_COLORS[gap.company]?.light || "bg-muted")}>
                    {gap.company}
                  </span>
                </TableCell>
                <TableCell className="max-w-[220px] truncate" title={gap.gap}>{gap.gap}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {gap.location}
                  {(gap.building || gap.room_number) && (
                    <div className="text-[11px]">{gap.building} {gap.room_number ? `חדר ${gap.room_number}` : ""}</div>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => cycleStatus(gap)}
                    className={cn("text-xs px-2 py-0.5 rounded-full border", STATUS_STYLES[gap.status])}
                    title="לחץ למעבר לסטטוס הבא"
                  >
                    {gap.status}
                  </button>
                </TableCell>
                <TableCell>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_STYLES[gap.priority])}>
                    {gap.priority}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatShortDate(gap.opened_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(gap.updated_date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onOpenDetails(gap)} title="פרטים">
                      <History className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(gap)} title="עריכה">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(gap)} title="מחיקה">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
