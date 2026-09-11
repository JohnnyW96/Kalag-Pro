import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, HardHat, AlertTriangle } from "lucide-react";
import GapCard, { PRIORITY_RANK, daysSince } from "@/components/gaps/GapCard";
import GapForm from "@/components/gaps/GapForm";
import GapFilters from "@/components/gaps/GapFilters";
import { PLUGOT } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState([]);
  const [priorityFilters, setPriorityFilters] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const [staleOnly, setStaleOnly] = useState(false);
  const [staleDays, setStaleDays] = useState(7);

  const loadGaps = useCallback(async () => {
    try {
      const data = await base44.entities.Gap.list("-created_date", 500);
      setGaps(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGaps();
    const unsubscribe = base44.entities.Gap.subscribe(() => {
      loadGaps();
    });
    return unsubscribe;
  }, [loadGaps]);

  const companies = PLUGOT;

  const filtered = useMemo(() => {
    let list = gaps.filter((g) => {
      if (statusFilters.length > 0 && !statusFilters.includes(g.status)) return false;
      if (priorityFilters.length > 0 && !priorityFilters.includes(g.priority)) return false;
      if (companyFilter !== "all" && g.company !== companyFilter) return false;
      if (staleOnly) {
        const d = daysSince(g.updated_date);
        if (d == null || d < staleDays || g.status === "טופל") return false;
      }
      if (search.trim()) {
        const q = search.trim();
        const hay = `${g.gap || ""} ${g.location || ""} ${g.company || ""} ${g.note || ""}`;
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "priority":
          return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
        case "stale": {
          const da = daysSince(a.updated_date) ?? 0;
          const db = daysSince(b.updated_date) ?? 0;
          return db - da;
        }
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "oldest":
          return new Date(a.created_date) - new Date(b.created_date);
        default:
          return 0;
      }
    });
    return list;
  }, [gaps, statusFilters, priorityFilters, companyFilter, staleOnly, staleDays, search, sort]);

  const stats = useMemo(() => {
    const byStatus = { "טרם הועלה": 0, "בטיפול": 0, "טופל": 0 };
    gaps.forEach((g) => {
      if (byStatus[g.status] != null) byStatus[g.status] += 1;
    });
    const staleCount = gaps.filter((g) => {
      const d = daysSince(g.updated_date);
      return d != null && d >= staleDays && g.status !== "טופל";
    }).length;
    return { ...byStatus, total: gaps.length, stale: staleCount };
  }, [gaps, staleDays]);

  const handleSubmit = async (form) => {
    if (editing) {
      await base44.entities.Gap.update(editing.id, form);
    } else {
      await base44.entities.Gap.create(form);
    }
    await loadGaps();
  };

  const handleStatusChange = async (gap, status) => {
    if (gap.status === status) return;
    await base44.entities.Gap.update(gap.id, { status });
    await loadGaps();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await base44.entities.Gap.delete(deleting.id);
    setDeleting(null);
    await loadGaps();
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (gap) => {
    setEditing(gap);
    setFormOpen(true);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">מעקב פערי בנייה</h1>
              <p className="text-xs text-muted-foreground">ניהול ליקויים ומשימות בפרויקט</p>
            </div>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">הוסף פער</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="סה״כ פערים" value={stats.total} tone="slate" />
          <StatCard label="טרם הועלה" value={stats["טרם הועלה"]} tone="amber" />
          <StatCard label="בטיפול" value={stats["בטיפול"]} tone="blue" />
          <StatCard label="לא עודכנו לאחרונה" value={stats.stale} tone="red" icon={<AlertTriangle className="w-4 h-4" />} />
        </div>

        {/* Filters */}
        <GapFilters
          search={search}
          setSearch={setSearch}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          priorityFilters={priorityFilters}
          setPriorityFilters={setPriorityFilters}
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          companies={companies}
          sort={sort}
          setSort={setSort}
          staleOnly={staleOnly}
          setStaleOnly={setStaleOnly}
          staleDays={staleDays}
          setStaleDays={setStaleDays}
        />

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">אין פערים להצגה</p>
            <p className="text-sm mt-1">שנה את הסננים או הוסף פער חדש.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((gap) => (
              <GapCard
                key={gap.id}
                gap={gap}
                onEdit={openEdit}
                onDelete={setDeleting}
                onStatusChange={handleStatusChange}
                staleDays={staleDays}
              />
            ))}
          </div>
        )}
      </main>

      <GapForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת פער</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את הפער? פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatCard({ label, value, tone, icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        {icon || <span className="text-lg font-bold">{value}</span>}
      </div>
      <div>
        {icon && <p className="text-2xl font-bold leading-none">{value}</p>}
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}