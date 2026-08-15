import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { OrgProvider } from "@/lib/org-store";
import { AuthProvider } from "@/lib/auth";
import { ItemsProvider } from "@/lib/items-store";
import { ProductsProvider } from "@/lib/products-store";
import { PlacementsProvider } from "@/lib/placements-store";
import { FlowsProvider } from "@/lib/flows-store";
import { RequireAuth } from "@/components/shell/require-auth";
import LoginPage from "@/pages/login-page";
import { AppLayout } from "@/components/shell/app-layout";
const AssistantPage = lazy(() => import("@/pages/assistant-page"));
const ProductsPage = lazy(() => import("@/pages/products-page"));
const ProductEditorPage = lazy(() => import("@/pages/product-editor-page"));
const FlowsPage = lazy(() => import("@/pages/flows-page"));
const FlowStudioPage = lazy(() => import("@/pages/flow-studio-page"));
const PlacementsPage = lazy(() => import("@/pages/placements-page"));
const RunsPage = lazy(() => import("@/pages/runs-page"));
const ItemsPage = lazy(() => import("@/pages/items-page"));
const ItemDetailPage = lazy(() => import("@/pages/item-detail-page"));
const InsightsPage = lazy(() => import("@/pages/insights-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
      <ProductsProvider>
      <PlacementsProvider>
      <FlowsProvider>
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
            <Route path="products/new" element={<ProductEditorPage />} />
            <Route path="products/:id/edit" element={<ProductEditorPage />} />
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
      </FlowsProvider>
      </PlacementsProvider>
      </ProductsProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}
