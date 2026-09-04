"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmpresaAutorizadaDialog } from "./empresa-autorizada-dialog";
import { updateOrdemServicoAutorizada } from "@/lib/actions";
import type { EmpresaAutorizada } from "@/types";

const SEM_EMPRESA = "sem-empresa";

export function EmpresaAutorizadaCard({
  osId,
  empresasIniciais,
  empresaAutorizadaId,
  numeroOsAutorizada,
  referenciaAutorizada,
  produtoAutorizada,
  numeroSerieAutorizada,
  numeroSerieEquipamento,
}: {
  osId: string;
  empresasIniciais: EmpresaAutorizada[];
  empresaAutorizadaId: string | null;
  numeroOsAutorizada: string | null;
  referenciaAutorizada: string | null;
  produtoAutorizada: string | null;
  numeroSerieAutorizada: string | null;
  numeroSerieEquipamento: string | null;
}) {
  const [empresas, setEmpresas] = useState(empresasIniciais);
  const [empresaId, setEmpresaId] = useState(empresaAutorizadaId ?? SEM_EMPRESA);
  const [numeroOs, setNumeroOs] = useState(numeroOsAutorizada ?? "");
  const [referencia, setReferencia] = useState(referenciaAutorizada ?? "");
  const [produto, setProduto] = useState(produtoAutorizada ?? "");
  // Já preenche com o número de série do equipamento (Dados do Equipamento):
  // na autorizada é quase sempre o mesmo valor, evitando digitar 2x.
  const [numeroSerie, setNumeroSerie] = useState(numeroSerieAutorizada ?? numeroSerieEquipamento ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSalvar() {
    startTransition(async () => {
      try {
        await updateOrdemServicoAutorizada(osId, {
          empresaAutorizadaId: empresaId === SEM_EMPRESA ? null : empresaId,
          numeroOsAutorizada: numeroOs.trim() || null,
          referenciaAutorizada: referencia.trim() || null,
          produtoAutorizada: produto.trim() || null,
          numeroSerieAutorizada: numeroSerie.trim() || null,
        });
        toast.success("Dados da autorizada salvos");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Use isso quando o atendimento vier de uma assistência autorizada (ex: PRAXIS, IPC) — a peça já vem delas,
        então só a mão de obra é cobrada, e o pagamento é acertado depois em lote no Financeiro.
      </p>
      <div>
        <Label className="mb-1.5 block">Empresa autorizada</Label>
        <Select value={empresaId} onValueChange={setEmpresaId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEM_EMPRESA}>Nenhuma (cliente final)</SelectItem>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <EmpresaAutorizadaDialog
          onCreated={(id, nome) => {
            setEmpresas((prev) => [...prev, { id, nome, telefone: null, ativo: true, created_at: new Date().toISOString() }]);
            setEmpresaId(id);
          }}
        />
      </div>

      {empresaId !== SEM_EMPRESA && (
        <>
          <div>
            <Label htmlFor="numero_os_autorizada" className="mb-1.5 block">
              Nº OS da Autorizada
            </Label>
            <Input
              id="numero_os_autorizada"
              value={numeroOs}
              onChange={(e) => setNumeroOs(e.target.value)}
              placeholder="Ex: OS72111945"
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="referencia_autorizada" className="mb-1.5 block">
              Referência
            </Label>
            <Input
              id="referencia_autorizada"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ex: FW010096"
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="produto_autorizada" className="mb-1.5 block">
              Produto
            </Label>
            <Input
              id="produto_autorizada"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              placeholder="Descrição do produto usada pela autorizada"
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="numero_serie_autorizada" className="mb-1.5 block">
              Nº de Série
            </Label>
            <Input
              id="numero_serie_autorizada"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="Ex: FW01009606996252025"
              className="uppercase"
            />
          </div>
        </>
      )}

      <Button type="button" variant="outline" onClick={handleSalvar} disabled={isPending}>
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
