"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { criarOperadorKids, alternarOperadorAtivo, redefinirSenhaOperador, type OperadorKids } from "@/lib/kids-actions";

function RedefinirSenhaDialog({ operador }: { operador: OperadorKids }) {
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState("");
  const [isPending, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      try {
        await redefinirSenhaOperador(operador.id, senha);
        toast.success("Senha redefinida");
        setOpen(false);
        setSenha("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <KeyRound className="size-3.5" />
          Redefinir senha
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>{operador.nome ?? operador.email}</DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="nova_senha" className="mb-1.5 block">
            Nova senha
          </Label>
          <Input id="nova_senha" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} placeholder="Mínimo 6 caracteres" />
        </div>
        <DialogFooter>
          <Button type="button" onClick={salvar} disabled={isPending || senha.length < 6}>
            Salvar nova senha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinhaOperador({ operador }: { operador: OperadorKids }) {
  const [isPending, startTransition] = useTransition();

  function alternarAtivo(ativo: boolean) {
    startTransition(async () => {
      try {
        await alternarOperadorAtivo(operador.id, ativo);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar operador");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{operador.nome ?? "(sem nome)"}</p>
        <p className="truncate text-xs text-muted-foreground">{operador.email}</p>
      </div>
      <RedefinirSenhaDialog operador={operador} />
      <div className="flex items-center gap-2">
        <Switch checked={operador.ativo} onCheckedChange={alternarAtivo} disabled={isPending} />
        <span className="text-xs text-muted-foreground">{operador.ativo ? "Ativo" : "Inativo"}</span>
      </div>
    </div>
  );
}

function NovoOperadorDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function criar(formData: FormData) {
    startTransition(async () => {
      try {
        await criarOperadorKids(formData);
        toast.success("Operador criado");
        formRef.current?.reset();
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar operador");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Novo operador
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Novo operador</DialogTitle>
          <DialogDescription>O login pode usar um e-mail fictício — é só pra autenticar no sistema.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={criar} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome_operador" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome_operador" name="nome" required />
          </div>
          <div>
            <Label htmlFor="email_operador" className="mb-1.5 block">
              E-mail de login
            </Label>
            <Input id="email_operador" name="email" type="email" required placeholder="Ex.: operador1@voltcity.local" />
          </div>
          <div>
            <Label htmlFor="senha_operador" className="mb-1.5 block">
              Senha
            </Label>
            <Input id="senha_operador" name="senha" minLength={6} required placeholder="Mínimo 6 caracteres" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Criar operador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OperadoresKids({ operadores }: { operadores: OperadorKids[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Operadores</CardTitle>
          <CardDescription>Quem pode registrar pagamentos na tela da plaza.</CardDescription>
        </div>
        <NovoOperadorDialog />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {operadores.map((op) => (
          <LinhaOperador key={op.id} operador={op} />
        ))}
        {operadores.length === 0 && <p className="text-sm text-muted-foreground">Nenhum operador cadastrado ainda.</p>}
      </CardContent>
    </Card>
  );
}
