export type NavItem = {
  href: string;
  label: string;
  group: "Build" | "Run" | "Govern";
};

export const navItems: NavItem[] = [
  { href: "/products", label: "Products", group: "Build" },
  { href: "/flows", label: "Flows", group: "Build" },
  { href: "/placements", label: "Placements", group: "Run" },
  { href: "/runs", label: "Runs", group: "Run" },
  { href: "/items", label: "Items", group: "Run" },
  { href: "/insights", label: "Insights", group: "Govern" },
  { href: "/settings", label: "Settings", group: "Govern" },
];
