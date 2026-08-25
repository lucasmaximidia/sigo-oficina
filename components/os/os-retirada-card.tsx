"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PackageCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { setOrdemServicoRetirada } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function OsRetiradaCard({
  osId,
  garantiaDias,
  dataRetirada,
}: {
  osId: string;
  garantiaDias: number;
  dataRetirada: string | null;
}) {
  const [editando, setEditando] = useState(!dataRetirada);
  const [data, setData] = useState(dataRetirada ?? hoje());
  const [isPending, startTransition] = useTransition();

  function handleSalvar() {
    startTransition(async () => {
      try {
        await setOrdemServicoRetirada(osId, data);
        toast.success(dataRetirada ? "Data de retirada atualizada" : "Data de retirada registrada");
        setEditando(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar retirada");
      }
    });
  }

  function handleCancelar() {
    setData(dataRetirada ?? hoje());
    setEditando(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <PackageCheck className="size-4 text-primary" />
        Retirada e Garantia
      </p>

      {!editando && dataRetirada ? (
        <>
          <Badge variant="success" className="justify-center py-2 text-sm">
            Retirado em {formatDate(dataRetirada)} — garantia de {garantiaDias} dias ativa
          </Badge>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Pencil className="size-3.5" />
            Alterar data de retirada
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            A garantia começa a contar a partir da retirada do equipamento pelo cliente — nem sempre é a mesma data
            do pagamento. Você pode ajustar essa data sempre que precisar.
          </p>
          <div>
            <Label htmlFor="data_retirada" className="mb-1.5 block">
              Data de retirada
            </Label>
            <Input id="data_retirada" type="date" value={data} max={hoje()} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={handleSalvar} disabled={isPending}>
              {isPending ? "Salvando..." : dataRetirada ? "Salvar alteração" : "Registrar retirada"}
            </Button>
            {dataRetirada && (
              <Button type="button" size="sm" variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
