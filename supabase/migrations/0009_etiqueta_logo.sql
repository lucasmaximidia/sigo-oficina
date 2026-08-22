-- Logo própria para o cabeçalho da etiqueta (separada da logo geral usada em
-- orçamentos e certificados), permitindo reservar a parte de cima da etiqueta
-- só para essa imagem.
alter table public.configuracoes add column etiqueta_logo_url text;
