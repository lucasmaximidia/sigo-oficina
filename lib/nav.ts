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
  Scooter,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Itens sem seção pertencem à oficina (Casa dos Reparos). "locacao" é a
  // segunda empresa (VoltCity, aluguel de scooter/bicicleta elétrica) —
  // mesmo login, área e dados totalmente à parte. O divisor visual entre
  // seções é desenhado por SidebarNav a partir dessa marcação.
  secao?: "locacao";
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
  { href: "/locacao", label: "Locação", icon: Scooter, secao: "locacao" },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
