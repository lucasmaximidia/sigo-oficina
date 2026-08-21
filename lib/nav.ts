import {
  LayoutGrid,
  Wrench,
  ShoppingCart,
  CalendarDays,
  Wallet,
  Boxes,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/ordens-servico", label: "OS", icon: Wrench },
  { href: "/pdv", label: "PDV", icon: ShoppingCart },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/garantias", label: "Garantias", icon: ShieldCheck },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
