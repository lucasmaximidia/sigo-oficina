// Ícones desenhados manualmente com formas simples (sem depender de lucide-react),
// porque bibliotecas de ícones marcadas como "use client" não podem ser usadas
// dentro de uma Route Handler (que roda no servidor) ao gerar a imagem da etiqueta.

type IconProps = { size?: number; color?: string };

export function IconPessoa({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2.2} />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

export function IconTelefone({ size = 16, color = "#ffffff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h5l2 5-2.5 1.5a13 13 0 0 0 5 5L15 13l5 2v5a2 2 0 0 1-2 2C9 22 2 15 2 6a2 2 0 0 1 2-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconAlerta({ size = 22, color = "#ffffff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="12,3 22,20 2,20" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
      <line x1="12" y1="9.5" x2="12" y2="14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.15" fill={color} />
    </svg>
  );
}

export function IconCaixa({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="14" rx="2" stroke={color} strokeWidth={2.2} />
      <path d="M3 7l3-4h12l3 4" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
      <line x1="3" y1="7" x2="21" y2="7" stroke={color} strokeWidth={2.2} />
    </svg>
  );
}

export function IconCalendario({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth={2.2} />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={2.2} />
      <line x1="8" y1="2.5" x2="8" y2="6.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}
