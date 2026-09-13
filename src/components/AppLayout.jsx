import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import AdminPanel from "./AdminPanel";
import NotificationsBell from "./NotificationsBell";

const LOGO_URL = "https://media.base44.com/images/public/6aa1c4c872f2848a151a92bf/98fcd8299_image.png";
const CHARACTER_URL = "https://media.base44.com/images/public/6aa1c4c872f2848a151a92bf/89a22bb0d_image.png";
const WATERMARK_URL = "https://media.base44.com/images/public/6aa1c4c872f2848a151a92bf/97bf84ed7_image.png";

export default function AppLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05] bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${WATERMARK_URL})` }}
      />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 shadow-md">
          <header className="bg-slate-900 text-white border-b border-slate-700">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
              <img src={LOGO_URL} alt="סמל ראשית הצירים" className="w-9 h-9 rounded-full object-cover" />
              <h1 className="text-xl font-bold tracking-tight">ראשית הצירים</h1>
              <div className="flex items-center gap-2">
                <img src={CHARACTER_URL} alt="" className="h-10 w-10 object-contain" />
                <NotificationsBell />
                <AdminPanel />
              </div>
            </div>
          </header>
          <TopNav />
        </div>
        <Outlet />
      </div>
    </div>
  );
}