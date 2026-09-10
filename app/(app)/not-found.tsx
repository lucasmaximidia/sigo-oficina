import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

// Versão "dentro da casca": mantém sidebar/topbar (renderizados pelo
// AppLayout ao redor), só o conteúdo principal é substituído — usada quando
// notFound() é chamado dentro de uma página autenticada (ex.: id inexistente).
export default function AppNotFound() {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="size-6" strokeWidth={2.25} />
      </div>
      <h1 className="font-display text-xl font-bold text-foreground">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">O que você procurava não existe ou foi removido.</p>
      <Button asChild className="mt-2">
        <Link href="/dashboard">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
