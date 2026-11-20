import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CARTAO_LABEL: Record<string, string> = {
  "15MIN": "15 MIN",
  "5MIN": "5 MIN",
  LIVRE: "Livre",
};

export interface ResumoPeriodo {
  porTipo: Record<string, { qtd: number; minutos: number }>;
  totalQtd: number;
  totalMinutos: number;
}

export interface ResumoCarrinho {
  numeroCarrinho: number;
  hoje: ResumoPeriodo;
  mes: ResumoPeriodo;
}

function ListaPorTipo({ periodo }: { periodo: ResumoPeriodo }) {
  if (periodo.totalQtd === 0) {
    return <p className="text-xs text-muted-foreground">Sem aluguéis</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(periodo.porTipo).map(([tipo, v]) => (
        <p key={tipo} className="text-sm">
          <span className="font-medium">{v.qtd}</span>{" "}
          <span className="text-muted-foreground">{CARTAO_LABEL[tipo] ?? tipo}</span>{" "}
          <span className="text-muted-foreground">· {v.minutos} min</span>
        </p>
      ))}
      <p className="mt-1 text-xs text-muted-foreground">
        Total: {periodo.totalQtd} aluguel(éis) · {periodo.totalMinutos} min
      </p>
    </div>
  );
}

export function ResumoDispositivos({ resumos }: { resumos: ResumoCarrinho[] }) {
  if (resumos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum carrinho cadastrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumos.map((r) => (
        <Card key={r.numeroCarrinho}>
          <CardHeader>
            <CardTitle>Carrinho #{r.numeroCarrinho}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-0">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hoje</p>
              <ListaPorTipo periodo={r.hoje} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mês</p>
              <ListaPorTipo periodo={r.mes} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
