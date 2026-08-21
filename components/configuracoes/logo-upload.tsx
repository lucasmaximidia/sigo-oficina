"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadLogoEmpresa } from "@/lib/actions";

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.set("logo", file);
    startTransition(async () => {
      try {
        const url = await uploadLogoEmpresa(formData);
        setPreview(url);
        toast.success("Logo atualizada");
      } catch (error) {
        setPreview(logoUrl);
        toast.error(error instanceof Error ? error.message : "Erro ao enviar a logo");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo da empresa" className="size-full object-contain" />
        ) : (
          <Building2 className="size-8 text-muted-foreground" />
        )}
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          {isPending ? "Enviando..." : "Alterar Logo"}
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG ou SVG até 2MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
