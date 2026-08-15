import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Gate for every signed-in route.
 *
 * Two checks, not one: whether there is a session at all, and whether this role
 * may reach this route. Sending an unauthorised user to the assistant rather
 * than a "denied" page keeps the app usable — the nav already hides what they
 * cannot reach, so landing here means a typed URL or a stale bookmark.
 */
export function RequireAuth() {
  const { user, allowedRoutes } = useAuth();
  const { pathname } = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;

  const base = `/${pathname.split("/")[1] ?? ""}`;
  const open = base === "/assistant" || base === "/";
  if (!open && !allowedRoutes.includes(base)) {
    return <Navigate to="/assistant" replace />;
  }

  return <Outlet />;
}
