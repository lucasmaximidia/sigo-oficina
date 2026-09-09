"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form action={handleSubmit} className="flex flex-col gap-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <div>
            <Label htmlFor="email" className="mb-1.5 block">
              Email
            </Label>
            <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              Senha
            </Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" disabled={isPending} className="mt-1">
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
