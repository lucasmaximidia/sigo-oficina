const LARGURA = 640;
const ALTURA = 220;
const BASELINE = 180;
const TOPO_MAX = 30;
const BAR_WIDTH = 64;
const GAP = 28;
const PADDING_ESQUERDA = 40;

function formatMil(valor: number) {
  return (valor / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "k";
}

export function FaturamentoChart({ meses }: { meses: { label: string; valor: number }[] }) {
  const max = Math.max(1, ...meses.map((m) => m.valor)) * 1.1;
  const alturaUtil = BASELINE - TOPO_MAX;

  return (
    <svg width="100%" height={ALTURA} viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
      <line x1={PADDING_ESQUERDA - 10} y1={BASELINE} x2={LARGURA - 30} y2={BASELINE} stroke="var(--color-border)" strokeWidth={1} />
      {meses.map((mes, i) => {
        const altura = Math.max(2, (mes.valor / max) * alturaUtil);
        const x = PADDING_ESQUERDA + i * (BAR_WIDTH + GAP);
        const y = BASELINE - altura;
        const atual = i === meses.length - 1;
        return (
          <g key={mes.label + i}>
            <rect
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={altura}
              rx={4}
              fill={atual ? "var(--color-primary)" : "var(--color-accent)"}
            />
            <text
              x={x + BAR_WIDTH / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize={atual ? 12 : 11}
              fontWeight={atual ? 700 : 400}
              fill={atual ? "var(--color-primary)" : "var(--color-muted-foreground)"}
              fontFamily="Inter, sans-serif"
            >
              {formatMil(mes.valor)}
            </text>
            <text
              x={x + BAR_WIDTH / 2}
              y={BASELINE + 18}
              textAnchor="middle"
              fontSize={12}
              fontWeight={atual ? 700 : 400}
              fill={atual ? "var(--color-primary)" : "var(--color-muted-foreground)"}
              fontFamily="Inter, sans-serif"
            >
              {mes.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
