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
  FileText,
  Receipt,
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
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/pdv", label: "PDV", icon: ShoppingCart },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/garantias", label: "Garantias", icon: ShieldCheck },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
