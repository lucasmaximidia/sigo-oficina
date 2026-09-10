import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/layout/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      icon={<SearchX className="size-7" strokeWidth={2.25} />}
      title="Página não encontrada"
      description="O endereço que você acessou não existe ou foi movido."
    >
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </StatusScreen>
  );
}
