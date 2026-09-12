import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, HardHat, AlertTriangle, LayoutGrid, Table2, Download, ChevronRight, ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GapCard from "@/components/gaps/GapCard";
import GapForm from "@/components/gaps/GapForm";
import GapFilters from "@/components/gaps/GapFilters";
import GapTableView from "@/components/gaps/GapTableView";
import GapStats from "@/components/gaps/GapStats";
import GapDetailsModal from "@/components/gaps/GapDetailsModal";
import { PLUGOT } from "@/lib/constants";
import {
  PRIORITY_RANK,
  STATUSES,
  daysSince,
  currentUserLabel,
  buildGapsCsv,
  downloadCsv,
  GAP_FIELD_LABELS,
} from "@/components/gaps/gapHelpers";
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

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function Home() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [detailsGap, setDetailsGap] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState("gaps");
  const [viewMode, setViewMode] = useState("cards");

  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState([]);
  const [priorityFilters, setPriorityFilters] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const [columnSort, setColumnSort] = useState(null); // {field, dir} — עוקף את sort כשלוחצים כותרת בטבלה
  const [staleOnly, setStaleOnly] = useState(false);
  const [staleDays, setStaleDays] = useState(7);

  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const [latestUpdates, setLatestUpdates] = useState({});

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const loadGaps = useCallback(async () => {
    try {
      const data = await base44.entities.Gap.list("-created_date", 500);
      setGaps(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLatestUpdates = useCallback(async () => {
    try {
      const data = await base44.entities.GapUpdate.list("-created_date", 1000);
      const map = {};
      data.forEach((u) => {
        if (!map[u.gap_id]) map[u.gap_id] = u;
      });
      setLatestUpdates(map);
    } catch {
      // אין עדכונים עדיין — לא קריטי
    }
  }, []);

  useEffect(() => {
    loadGaps();
    loadLatestUpdates();
    const unsubGaps = base44.entities.Gap.subscribe(() => loadGaps());
    const unsubUpdates = base44.entities.GapUpdate.subscribe(() => loadLatestUpdates());
    return () => {
      unsubGaps && unsubGaps();
      unsubUpdates && unsubUpdates();
    };
  }, [loadGaps, loadLatestUpdates]);

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
        const hay = `${g.gap || ""} ${g.location || ""} ${g.company || ""} ${g.note || ""} ${g.opened_by_name || ""}`;
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (columnSort) {
        const { field, dir } = columnSort;
        let cmp = 0;
        if (field === "priority") cmp = (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
        else if (field === "status") cmp = STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
        else if (field === "opened_at") cmp = new Date(a.opened_at || 0) - new Date(b.opened_at || 0);
        else if (field === "updated_date") cmp = new Date(a.updated_date || 0) - new Date(b.updated_date || 0);
        return dir === "asc" ? cmp : -cmp;
      }
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
  }, [gaps, statusFilters, priorityFilters, companyFilter, staleOnly, staleDays, search, sort, columnSort]);

  // איפוס עמוד כשמשתנים סינון/מיון
  useEffect(() => { setPage(1); }, [statusFilters, priorityFilters, companyFilter, staleOnly, staleDays, search, sort, columnSort, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

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

  const logChange = async (gapId, changeType, field, oldValue, newValue) => {
    try {
      await base44.entities.GapChange.create({
        gap_id: gapId,
        change_type: changeType,
        field: field || "",
        field_label: field ? (GAP_FIELD_LABELS[field] || field) : "",
        old_value: oldValue != null ? String(oldValue) : "",
        new_value: newValue != null ? String(newValue) : "",
        changed_by: currentUserLabel(currentUser),
      });
    } catch {
      // אל תפיל את השמירה העיקרית אם רישום ה-Changelog נכשל
    }
  };

  const handleSubmit = async (form) => {
    if (editing) {
      const changedFields = Object.keys(GAP_FIELD_LABELS).filter((key) => (editing[key] || "") !== (form[key] || ""));
      await base44.entities.Gap.update(editing.id, form);
      await Promise.all(changedFields.map((field) => logChange(editing.id, "update", field, editing[field], form[field])));
    } else {
      const created = await base44.entities.Gap.create(form);
      await logChange(created.id, "create");
    }
    await loadGaps();
  };

  const handleStatusChange = async (gap, status) => {
    if (gap.status === status) return;
    await base44.entities.Gap.update(gap.id, { status });
    await logChange(gap.id, "update", "status", gap.status, status);
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

  const handleColumnSort = (field) => {
    setColumnSort((prev) => {
      if (prev && prev.field === field) {
        return { field, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { field, dir: "asc" };
    });
  };

  const handleExport = () => {
    const csv = buildGapsCsv(filtered, latestUpdates);
    downloadCsv(`פערים-${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ייצוא לאקסל</span>
            </Button>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">הוסף פער</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats top cards */}
        <div dir="rtl" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="סה״כ פערים" value={stats.total} tone="slate" />
          <StatCard label="טרם הועלה" value={stats["טרם הועלה"]} tone="amber" />
          <StatCard label="בטיפול" value={stats["בטיפול"]} tone="blue" />
          <StatCard label="לא עודכנו לאחרונה" value={stats.stale} tone="red" icon={<AlertTriangle className="w-4 h-4" />} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="gaps">פערים</TabsTrigger>
            <TabsTrigger value="stats">סטטיסטיקות</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-4 mt-4">
            <div dir="rtl" className="flex flex-col lg:flex-row lg:items-start gap-3 w-full">
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
                setSort={(v) => { setSort(v); setColumnSort(null); }}
                staleOnly={staleOnly}
                setStaleOnly={setStaleOnly}
                staleDays={staleDays}
                setStaleDays={setStaleDays}
              />
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "cards" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
                  title="תצוגת כרטיסיות"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "table" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
                  title="תצוגת טבלה"
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">אין פערים להצגה</p>
                <p className="text-sm mt-1">שנה את הסננים או הוסף פער חדש.</p>
              </div>
            ) : viewMode === "table" ? (
              <GapTableView
                gaps={pageItems}
                sortField={columnSort?.field}
                sortDir={columnSort?.dir}
                onSort={handleColumnSort}
                onEdit={openEdit}
                onDelete={setDeleting}
                onStatusChange={handleStatusChange}
                onOpenDetails={setDetailsGap}
              />
            ) : (
              <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pageItems.map((gap) => (
                  <GapCard
                    key={gap.id}
                    gap={gap}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                    onStatusChange={handleStatusChange}
                    staleDays={staleDays}
                    latestUpdate={latestUpdates[gap.id]}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between gap-3 flex-wrap bg-white rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>פערים בעמוד:</span>
                  <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                    <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PER_PAGE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>מתוך {filtered.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">עמוד {page} מתוך {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <GapStats gaps={gaps} />
          </TabsContent>
        </Tabs>
      </main>

      <GapForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
      />

      <GapDetailsModal
        gap={detailsGap}
        open={!!detailsGap}
        onClose={() => setDetailsGap(null)}
        currentUser={currentUser}
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
