-- O cabeçalho da etiqueta passou a ser só a imagem enviada em
-- etiqueta_logo_url (sem texto sobreposto), tornando o subtítulo em texto
-- desnecessário.
alter table public.configuracoes drop column etiqueta_subtitulo;
