"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isPending, startTransition] = useTransition();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="border-border/80 shadow-lg">
      <CardContent className="p-6 md:pt-6">
        <form action={handleSubmit} className="flex flex-col gap-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <div>
            <Label htmlFor="email" className="mb-1.5 block">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              Senha
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                required
                autoUppercase={false}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={isPending} size="lg" className="mt-1">
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
