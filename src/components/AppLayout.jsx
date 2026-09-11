import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

const LOGO_URL = "https://media.base44.com/images/public/6aa1c4c872f2848a151a92bf/98fcd8299_image.png";

export default function AppLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      <header className="bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          <img src={LOGO_URL} alt="סמל ראשית הצירים" className="w-9 h-9 rounded-full object-cover" />
          <h1 className="text-xl font-bold tracking-tight">ראשית הצירים</h1>
        </div>
      </header>
      <TopNav />
      <Outlet />
    </div>
  );
}