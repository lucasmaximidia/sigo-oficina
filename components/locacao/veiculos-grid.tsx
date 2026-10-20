"use client";

import { VeiculoCard, type AluguelAtivo } from "@/components/locacao/veiculo-card";
import { VeiculoDialog } from "@/components/locacao/veiculo-dialog";
import type { LocacaoVeiculo } from "@/types";

export function VeiculosGrid({
  veiculos,
  alugueisPorVeiculo,
  kmPorVeiculo,
  clientes,
}: {
  veiculos: LocacaoVeiculo[];
  alugueisPorVeiculo: Record<string, AluguelAtivo>;
  kmPorVeiculo: Record<string, number>;
  clientes: { id: string; nome: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {veiculos.map((veiculo) => (
        <VeiculoCard
          key={veiculo.id}
          veiculo={veiculo}
          aluguel={alugueisPorVeiculo[veiculo.id] ?? null}
          kmAtual={kmPorVeiculo[veiculo.id] ?? null}
          clientes={clientes}
        />
      ))}
      {veiculos.length === 0 && (
        <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado ainda.</p>
          <VeiculoDialog />
        </div>
      )}
    </div>
  );
}
