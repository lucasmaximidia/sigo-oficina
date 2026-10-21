-- Dados da locadora (VoltCity) usados no contrato de locação em PDF, gerado
-- a cada aluguel (ver components/locacao/contrato-pdf.tsx) — pessoa jurídica
-- distinta da oficina (que já tem seus próprios dados em "configuracoes").
-- Default: exatamente o texto do termo/contrato usado antes do sistema.
alter table public.locacao_config
  add column locadora_razao_social text not null default '49.984.707 JESSICA LUIZA PEREIRA ARAGÃO',
  add column locadora_cnpj text not null default '49.984.707/0001-79',
  add column locadora_endereco text not null default 'Rua Padre Santi Cordiolli, 26 – Centro – Montanha/ES';
