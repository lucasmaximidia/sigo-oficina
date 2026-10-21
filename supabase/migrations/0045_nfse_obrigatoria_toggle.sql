-- A obrigatoriedade de NFS-e pra pagamento em cartão/PIX ainda não é lei
-- hoje pra essa oficina — o sistema estava forçando antes da hora. Vira
-- uma configuração: desligada por padrão (reflete a realidade de hoje),
-- pra ligar quando a obrigação entrar em vigor.
alter table public.configuracoes
  add column nfse_obrigatoria_cartao_pix boolean not null default false;
