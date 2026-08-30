-- Campo de observações internas da OS: visível só pra oficina, nunca
-- aparece em PDFs, etiquetas, certificados ou mensagens pro cliente.
alter table public.ordens_servico
  add column observacoes_internas text;
