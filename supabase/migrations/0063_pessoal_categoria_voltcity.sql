-- Nova categoria de lançamento de cartão pessoal: "voltcity" — gastos
-- pagos no cartão pessoal por conta da VoltCity (locação), que entram na
-- conta de "a receber de terceiros" junto com oficina e outra_pessoa.
alter table public.pessoal_cartao_lancamentos
  drop constraint pessoal_cartao_lancamentos_categoria_check;

alter table public.pessoal_cartao_lancamentos
  add constraint pessoal_cartao_lancamentos_categoria_check
  check (
    categoria in (
      'alimentacao', 'carro', 'casa', 'celular', 'farmacia', 'feira', 'lanches',
      'loja', 'oficina', 'igreja', 'outra_pessoa', 'outros', 'voltcity'
    )
  );
