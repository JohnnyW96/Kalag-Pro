import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { PLUGA_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function WithdrawalHistory({ open, onClose }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      base44.entities.WithdrawalRequest
        .list("-created_date", 100)
        .then(setWithdrawals)
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>היסטוריית משיכות</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">אין משיכות עדיין</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{w.requested_by_name}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      PLUGA_COLORS[w.pluga]?.light || "bg-muted"
                    )}
                  >
                    {w.pluga}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {w.warehouse} · {w.request_date}
                  {w.expected_return_date ? ` · החזרה: ${w.expected_return_date}` : ""}
                </p>
                <div className="flex flex-wrap gap-1">
                  {w.items?.map((i, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 px-2 py-0.5 rounded"
                    >
                      {i.name} ×{i.quantity}
                      {i.returnable ? " ↩" : ""}
                    </span>
                  ))}
                </div>
                {w.notes && <p className="text-xs text-muted-foreground">הערות: {w.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}