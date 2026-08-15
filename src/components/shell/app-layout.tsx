import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppTopbar } from "./topbar";
import { FloatingMarketSwitcher } from "./floating-market-switcher";
import { PageTransition } from "./page-transition";

/** Holds the frame's height while a route chunk arrives, so nothing reflows. */
function PageFallback() {
  return (
    <div className="flex-1 grid place-items-center" role="status" aria-label="Loading">
      <span className="size-5 rounded-full border-2 border-muted border-t-primary animate-spin" />
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="flex h-screen min-h-[640px] flex-col">
      <AppTopbar />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <PageTransition>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <FloatingMarketSwitcher />
    </div>
  );
}
