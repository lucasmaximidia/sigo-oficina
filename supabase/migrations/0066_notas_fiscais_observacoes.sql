-- Observações livres por nota fiscal + possibilidade de, antes de emitir,
-- alterar a descrição do serviço só daquela nota específica (o padrão em
-- configuracoes.nfse_descricao_padrao continua valendo pra todas as outras).
alter table notas_fiscais
  add column observacoes text;
