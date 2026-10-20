import { Bike, History, Users, Wallet } from "lucide-react";
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
];

export function locacaoItemAtivo(pathname: string, href: string) {
  return href === "/locacao" ? pathname === href : pathname.startsWith(href);
}

export function emLocacao(pathname: string) {
  return pathname === "/locacao" || pathname.startsWith("/locacao/");
}
