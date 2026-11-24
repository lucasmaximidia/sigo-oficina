"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2, Info, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Switch } from "@/components/ui/switch";
import { adicionarRedeWifi, alternarRedeWifiAtiva, removerRedeWifi } from "@/lib/locacao-dispositivos-actions";
import type { LocacaoDispositivoRede } from "@/types";

const LIMITE_REDES_ATIVAS = 5;

function LinhaRede({ rede }: { rede: LocacaoDispositivoRede }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isPending, startTransition] = useTransition();

  function alternarAtivo(ativo: boolean) {
    startTransition(async () => {
      try {
        await alternarRedeWifiAtiva(rede.id, ativo);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar rede");
      }
    });
  }

  function remover() {
    startTransition(async () => {
      try {
        await removerRedeWifi(rede.id);
        toast.success("Rede removida");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover rede");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{rede.ssid}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-mono">{rede.senha ? (mostrarSenha ? rede.senha : "•".repeat(Math.min(rede.senha.length, 12))) : "(sem senha)"}</span>
          {rede.senha && (
            <button type="button" onClick={() => setMostrarSenha((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {mostrarSenha ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Ordem {rede.ordem}</span>
      <div className="flex items-center gap-2">
        <Switch checked={rede.ativo} onCheckedChange={alternarAtivo} disabled={isPending} />
        <span className="text-xs text-muted-foreground">{rede.ativo ? "Ativa" : "Inativa"}</span>
      </div>
      <button type="button" onClick={remover} disabled={isPending} className="text-muted-foreground hover:text-destructive disabled:opacity-50">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function RedesWifiCarrinhos({ redes }: { redes: LocacaoDispositivoRede[] }) {
  const [isPending, startTransition] = useTransition();
  const [mostrarSenhaNova, setMostrarSenhaNova] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const ordenadas = [...redes].sort((a, b) => a.ordem - b.ordem || a.created_at.localeCompare(b.created_at));
  const ativas = ordenadas.filter((r) => r.ativo);
  const excedentes = ativas.length - LIMITE_REDES_ATIVAS;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await adicionarRedeWifi(formData);
        toast.success("Rede adicionada");
        formRef.current?.reset();
        setMostrarSenhaNova(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar rede");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redes Wi-Fi dos carrinhos</CardTitle>
        <CardDescription>Até 5 redes ativas (pela ordem) são enviadas para a frota.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-info" />
          <p>
            Os carrinhos recebem a lista em até 1 minuto, mas só pela rede em que já estão conectados. Cadastre a rede
            nova ANTES de levar o carrinho para outro lugar. Use redes de 2,4 GHz.
          </p>
        </div>

        {excedentes > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              Há {ativas.length} redes ativas, mas só as 5 primeiras (pela ordem) vão para os carrinhos. {excedentes}{" "}
              rede(s) não serão aplicadas: {ativas.slice(LIMITE_REDES_ATIVAS).map((r) => r.ssid).join(", ")}.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {ordenadas.map((rede) => (
            <LinhaRede key={rede.id} rede={rede} />
          ))}
          {ordenadas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma rede cadastrada ainda.</p>}
        </div>

        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="ssid" className="mb-1.5 block">
              Nome da rede (SSID)
            </Label>
            <Input id="ssid" name="ssid" maxLength={32} required placeholder="Ex.: Base VoltCity" />
          </div>
          <div className="flex-1">
            <Label htmlFor="senha_rede" className="mb-1.5 block">
              Senha
            </Label>
            <div className="relative">
              <Input id="senha_rede" name="senha" type={mostrarSenhaNova ? "text" : "password"} maxLength={64} />
              <button
                type="button"
                onClick={() => setMostrarSenhaNova((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              >
                {mostrarSenhaNova ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>
          <div className="w-24">
            <Label htmlFor="ordem" className="mb-1.5 block">
              Ordem
            </Label>
            <NumericInput id="ordem" name="ordem" decimal={false} defaultValue={0} />
          </div>
          <Button type="submit" disabled={isPending}>
            <Plus className="size-4" />
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
