import { Bike, History, Users, Wallet, BarChart3, Image as ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface LocacaoNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const LOCACAO_NAV_ITEMS: LocacaoNavItem[] = [
  { href: "/locacao", label: "Veículos", icon: Bike },
  { href: "/locacao/alugueis", label: "Aluguéis", icon: History },
  { href: "/locacao/clientes", label: "Clientes", icon: Users },
  { href: "/locacao/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/locacao/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/locacao/icones", label: "Ícones", icon: ImageIcon },
];

export function locacaoItemAtivo(pathname: string, href: string) {
  return href === "/locacao" ? pathname === href : pathname.startsWith(href);
}

export function emLocacao(pathname: string) {
  return pathname === "/locacao" || pathname.startsWith("/locacao/");
}
