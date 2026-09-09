import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

const STATUSES = ["טרם הועלה", "בטיפול", "טופל"];
const PRIORITIES = ["נמוך", "בינוני", "גבוה", "קריטי"];

export default function GapFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  companyFilter,
  setCompanyFilter,
  companies,
  sort,
  setSort,
  staleOnly,
  setStaleOnly,
  staleDays,
  setStaleDays,
}) {
  return (
    <div dir="rtl" className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש חופשי בתיאור, מיקום, פלוגה..."
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-[170px]"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="md:w-[150px]"><SelectValue placeholder="עדיפות" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל העדיפויות</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="md:w-[170px]"><SelectValue placeholder="פלוגה" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הפלוגות</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="md:w-[200px]">
            <SlidersHorizontal className="w-4 h-4 ml-1" />
            <SelectValue placeholder="מיון" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">חשיבות (גבוהה → נמוכה)</SelectItem>
            <SelectItem value="stale">לא עודכן לאחרונה (ישן → חדש)</SelectItem>
            <SelectItem value="newest">חדש ביותר</SelectItem>
            <SelectItem value="oldest">ישן ביותר</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={staleOnly}
            onChange={(e) => setStaleOnly(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-muted-foreground">הצג רק פערים שלא עודכנו</span>
          <Input
            type="number"
            min={1}
            value={staleDays}
            onChange={(e) => setStaleDays(Math.max(1, Number(e.target.value) || 1))}
            className="w-20 h-8"
          />
          <span className="text-muted-foreground">ימים או יותר</span>
        </label>
      </div>
    </div>
  );
}