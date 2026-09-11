import { NavLink } from "react-router-dom";
import { HardHat, CalendarDays, CalendarRange, ClipboardList, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "פערים", icon: HardHat },
  { to: "/shotaf", label: "שוטף", icon: CalendarDays },
  { to: "/constraints", label: "אילוצים", icon: CalendarRange },
  { to: "/tasks", label: "משימות", icon: ClipboardCheck },
  { to: "/daily-summary", label: "סיכום מסדר", icon: ClipboardList },
];

export default function TopNav() {
  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-2 flex items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}