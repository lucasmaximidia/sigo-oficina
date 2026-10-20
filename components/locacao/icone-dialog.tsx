"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Upload, ImageIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { criarIcone, editarIcone } from "@/lib/locacao-actions";
import type { LocacaoIcone } from "@/types";

export function IconeDialog({ icone }: { icone?: LocacaoIcone }) {
  const editando = !!icone;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(icone?.arquivo_url ?? null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : (icone?.arquivo_url ?? null));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editando) {
          await editarIcone(icone.id, formData);
          toast.success("Ícone atualizado");
        } else {
          await criarIcone(formData);
          toast.success("Ícone adicionado");
          formRef.current?.reset();
          setPreview(null);
        }
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar ícone");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editando ? (
          <button
            type="button"
            aria-label="Editar ícone"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
        ) : (
          <Button type="button">
            <Plus className="size-4" />
            Novo ícone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar ícone" : "Novo ícone"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Troque o nome e, se quiser, envie uma imagem nova — ela substitui a atual em todos os veículos que a usam."
              : "Use uma imagem com fundo e estilo parecidos com os ícones já cadastrados, pra manter o visual consistente."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Pré-visualização" className="size-full object-contain" />
              ) : (
                <ImageIcon className="size-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="arquivo" className="mb-1.5 block">
                Imagem
              </Label>
              <Input
                id="arquivo"
                name="arquivo"
                type="file"
                accept="image/*"
                required={!editando}
                onChange={handleFileChange}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {editando ? "Deixe em branco pra manter a imagem atual." : "PNG, SVG ou WebP com fundo."}
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome" name="nome" required defaultValue={icone?.nome ?? ""} placeholder="Ex.: Quadriciclo vermelho" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              <Upload className="size-4" />
              {isPending ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar ícone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
