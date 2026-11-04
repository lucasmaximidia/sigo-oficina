-- Guarda o corpo bruto do último webhook da Notaas recebido pra cada nota —
-- os nomes de campo reais já divergiram da documentação deles mais de uma
-- vez (endpoint de emissão, nomes de campo do payload). Com isso dá pra
-- diagnosticar direto no banco, sem depender de pedir print do painel da
-- Notaas toda vez que algo não bate.
alter table notas_fiscais
  add column webhook_bruto jsonb;
