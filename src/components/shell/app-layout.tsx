import { Outlet } from "react-router-dom";
import { AppTopbar } from "./topbar";
import { FloatingMarketSwitcher } from "./floating-market-switcher";
import { PageTransition } from "./page-transition";

export function AppLayout() {
  return (
    <div className="flex h-screen min-h-[640px] flex-col">
      <AppTopbar />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <FloatingMarketSwitcher />
    </div>
  );
}
