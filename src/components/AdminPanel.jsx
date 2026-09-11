import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Check, X, Loader2, Mail } from "lucide-react";

const ROLES = ["קלפ", "רסר", "סגל", "admin"];

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [roleOverrides, setRoleOverrides] = useState({});

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await base44.entities.AccessRequest.filter({ status: "pending" });
      setRequests(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadRequests();
    const unsubscribe = base44.entities.AccessRequest.subscribe(() => loadRequests());
    return unsubscribe;
  }, [user, loadRequests]);

  if (user?.role !== "admin") return null;

  const pendingCount = requests.length;

  const handleApprove = async (request) => {
    const role = roleOverrides[request.id] || "קלפ";
    setProcessing(request.id);
    try {
      await base44.users.inviteUser(request.email, role);
      await base44.entities.AccessRequest.update(request.id, {
        status: "approved",
        assigned_role: role,
      });
      setRoleOverrides((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (request) => {
    setProcessing(request.id);
    try {
      await base44.entities.AccessRequest.update(request.id, { status: "denied" });
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="ניהול משתמשים ובקשות גישה"
        >
          <UserCog className="w-5 h-5 text-white" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {pendingCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-right">ניהול משתמשים ובקשות גישה</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">אין בקשות גישה חדשות</p>
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="border rounded-lg p-4 bg-white space-y-3">
                <div>
                  <p className="font-medium text-sm">{r.email}</p>
                  {r.full_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{r.full_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">תפקיד:</span>
                  <Select
                    value={roleOverrides[r.id] || "קלפ"}
                    onValueChange={(v) =>
                      setRoleOverrides((prev) => ({ ...prev, [r.id]: v }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(r)}
                    disabled={processing === r.id}
                    className="flex-1 gap-1.5"
                  >
                    {processing === r.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    אישור והזמנה
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeny(r)}
                    disabled={processing === r.id}
                    className="gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    דחייה
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}