// Leitura do estado de um carrinho (ESP32) — tudo derivado dos campos que o
// próprio dispositivo reporta em cada heartbeat (ver dispositivo_heartbeat,
// migration 0071_locacao_dispositivos.sql).

// "Online" é calculado no momento da renderização (não é um valor salvo) —
// como qualquer página deste app, só atualiza quando a tela é recarregada.
const ONLINE_JANELA_MINUTOS = 3;

export function dispositivoEstaOnline(ultimaConexao: string | null): boolean {
  if (!ultimaConexao) return false;
  const diffMs = Date.now() - new Date(ultimaConexao).getTime();
  return diffMs >= 0 && diffMs <= ONLINE_JANELA_MINUTOS * 60_000;
}

// Curva de descarga de uma bateria de chumbo-ácido 24V (4 pontos medidos),
// interpolada linearmente entre eles — fora da faixa, satura em 0%/100%.
const CURVA_BATERIA_24V: [volts: number, percentual: number][] = [
  [21.0, 0],
  [22.6, 10],
  [24.1, 50],
  [25.4, 100],
];

export function percentualBateria(volts: number | null): number | null {
  if (volts == null) return null;
  if (volts <= CURVA_BATERIA_24V[0][0]) return 0;
  const ultimo = CURVA_BATERIA_24V[CURVA_BATERIA_24V.length - 1];
  if (volts >= ultimo[0]) return 100;

  for (let i = 0; i < CURVA_BATERIA_24V.length - 1; i++) {
    const [v0, p0] = CURVA_BATERIA_24V[i];
    const [v1, p1] = CURVA_BATERIA_24V[i + 1];
    if (volts >= v0 && volts <= v1) {
      const t = (volts - v0) / (v1 - v0);
      return Math.round(p0 + t * (p1 - p0));
    }
  }
  return 0;
}

export function formatarHorimetro(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const min = minutos % 60;
  return `${horas}h${min > 0 ? ` ${min}min` : ""}`;
}

// Compara "2.2.0" com "2.10.1" etc. (numérico por posição, não lexicográfico).
function versaoMaiorOuIgual(versao: string | null, minima: string): boolean {
  if (!versao) return false;
  const a = versao.split(".").map((n) => parseInt(n, 10) || 0);
  const b = minima.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av > bv;
  }
  return true;
}

// O selo só aparece quando o firmware já suporta a lista de redes (2.2.0+) e
// o carrinho conectou depois da última mudança nela — antes disso ele ainda
// está rodando com a lista antiga (ver dispositivo_heartbeat_v3).
export function redesWifiAtualizadas(
  firmwareVersao: string | null,
  ultimaConexao: string | null,
  ultimaAtualizacaoRedes: string | null
): boolean {
  if (!ultimaAtualizacaoRedes || !ultimaConexao) return false;
  if (!versaoMaiorOuIgual(firmwareVersao, "2.2.0")) return false;
  return new Date(ultimaConexao).getTime() > new Date(ultimaAtualizacaoRedes).getTime();
}

export type StatusManutencao = "ok" | "proxima" | "vencida";

export interface ManutencaoInfo {
  status: StatusManutencao;
  horasRodadas: number;
  horasRestantes: number;
}

// Horas rodadas desde a última manutenção registrada (ou desde o cadastro do
// carrinho, se nunca fez). "Próxima" a partir de 80% do intervalo.
export function infoManutencao(
  horimetroMinutos: number,
  manutencaoHorimetroMin: number,
  horasManutencao: number
): ManutencaoInfo {
  const horasRodadas = Math.max(0, horimetroMinutos - manutencaoHorimetroMin) / 60;
  const horasRestantes = horasManutencao - horasRodadas;
  const status: StatusManutencao = horasRestantes <= 0 ? "vencida" : horasRestantes <= horasManutencao * 0.2 ? "proxima" : "ok";
  return { status, horasRodadas, horasRestantes };
}
