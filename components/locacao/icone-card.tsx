"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { excluirIcone } from "@/lib/locacao-actions";
import type { LocacaoIcone } from "@/types";

export function IconeCard({ icone, emUso }: { icone: LocacaoIcone; emUso: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icone.arquivo_url} alt={icone.nome} className="size-full object-contain" />
      </div>
      <p className="text-sm font-medium text-foreground">{icone.nome}</p>
      <p className="text-xs text-muted-foreground">
        {emUso > 0 ? `Em uso em ${emUso} veículo${emUso === 1 ? "" : "s"}` : "Sem veículo usando"}
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await excluirIcone(icone.id, icone.arquivo_url);
              toast.success("Ícone excluído");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Erro ao excluir ícone");
            }
          })
        }
        className="mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
        Excluir
      </button>
    </div>
  );
}
