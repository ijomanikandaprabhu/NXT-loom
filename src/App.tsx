import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { OrgProvider } from "@/lib/org-store";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/shell/require-auth";
import LoginPage from "@/pages/login-page";
import { AppLayout } from "@/components/shell/app-layout";
import AssistantPage from "@/pages/assistant-page";
import ProductsPage from "@/pages/products-page";
import FlowsPage from "@/pages/flows-page";
import FlowStudioPage from "@/pages/flow-studio-page";
import PlacementsPage from "@/pages/placements-page";
import RunsPage from "@/pages/runs-page";
import ItemsPage from "@/pages/items-page";
import ItemDetailPage from "@/pages/item-detail-page";
import InsightsPage from "@/pages/insights-page";
import SettingsPage from "@/pages/settings-page";

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
      <I18nProvider>
        <TooltipProvider delayDuration={200}>
        <BrowserRouter>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/assistant" replace />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="flows" element={<FlowsPage />} />
            <Route path="flows/:id" element={<FlowStudioPage />} />
            <Route path="placements" element={<PlacementsPage />} />
            <Route path="runs" element={<RunsPage />} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="items/:id" element={<ItemDetailPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          </Route>
          <Route path="*" element={<Navigate to="/assistant" replace />} />
        </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
