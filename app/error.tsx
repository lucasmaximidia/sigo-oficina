"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/layout/status-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={<AlertTriangle className="size-7" strokeWidth={2.25} />}
      title="Algo deu errado"
      description="Ocorreu um erro inesperado. Você pode tentar novamente ou voltar ao início."
    >
      <Button variant="outline" asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </StatusScreen>
  );
}
