import React from "react";
import { Button } from "@/components/ui/button";
import { PLUGA_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Undo2, PackageOpen } from "lucide-react";

export default function EquipmentHoldingsInline({ holdings, canEdit, onReturn }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <PackageOpen className="w-4 h-4 text-amber-600" />
        <h2 className="text-sm font-semibold text-muted-foreground">
          ציוד בשימוש ({holdings.length})
        </h2>
      </div>
      {holdings.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border border-border rounded-xl bg-white">
          <p className="text-sm">אין ציוד בשימוש כרגע</p>
        </div>
      ) : (
        <div className="space-y-2">
          {holdings.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {h.item_name} ×{h.quantity}
                </p>
                <p className="text-xs text-muted-foreground">
                  {h.warehouse} · נמשך ע"י {h.held_by_name} ב-{h.withdrawal_date}
                  {h.expected_return_date ? ` · החזרה: ${h.expected_return_date}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium shrink-0",
                  PLUGA_COLORS[h.pluga]?.light || "bg-muted"
                )}
              >
                {h.pluga}
              </span>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReturn(h)}
                  className="gap-1 shrink-0"
                >
                  <Undo2 className="w-3.5 h-3.5" /> הוחזר
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}