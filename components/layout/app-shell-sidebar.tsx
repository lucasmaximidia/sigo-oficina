"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { LocacaoAppSidebar } from "@/components/locacao/locacao-app-sidebar";
import { emLocacao } from "@/components/locacao/locacao-nav";

// Escolhe qual sidebar ocupa a coluna esquerda — nunca os dois ao mesmo
// tempo. Dentro de /locacao, o menu da oficina inteiro sai de cena e dá
// lugar à navegação própria do módulo.
export function AppShellSidebar() {
  const pathname = usePathname();
  return emLocacao(pathname) ? <LocacaoAppSidebar /> : <AppSidebar />;
}
