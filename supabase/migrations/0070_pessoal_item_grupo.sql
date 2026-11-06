-- Agrupa itens do mês (ex: "Energia EDP", "Energia Solar", "Energia
-- Ar-condicionado" sob o grupo "ENERGIA") sem perder a confirmação
-- individual de cada um — a UI soma os dois lados (Previsto/Real) por grupo
-- e marca o grupo como pago quando todo item dele já tem valor_real.
alter table public.pessoal_itens_mes
  add column grupo text;
