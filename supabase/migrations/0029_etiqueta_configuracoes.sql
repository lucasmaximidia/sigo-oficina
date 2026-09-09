-- Configuração dinâmica das 3 etiquetas do sistema (peça/estoque, OS e OS de
-- autorizada): altura da etiqueta (a largura é fixa em 50mm, limite da
-- impressora térmica), se mostra o logo, e para cada campo — visibilidade,
-- ordem (posição no array), alinhamento e tamanho da fonte. Os valores
-- padrão abaixo reproduzem exatamente o layout fixo que já existia antes
-- dessa configuração, então nada muda visualmente até o usuário editar.
alter table public.configuracoes
  add column etiqueta_peca_config jsonb not null default '{
    "alturaMm": 30,
    "mostrarLogo": true,
    "campos": [
      { "id": "nome", "visivel": true, "alinhamento": "left", "tamanhoFonte": "grande" },
      { "id": "codigo", "visivel": true, "alinhamento": "left", "tamanhoFonte": "pequena" },
      { "id": "preco_venda", "visivel": true, "alinhamento": "center", "tamanhoFonte": "grande" }
    ]
  }'::jsonb,
  add column etiqueta_os_config jsonb not null default '{
    "alturaMm": 80,
    "mostrarLogo": true,
    "campos": [
      { "id": "cliente_nome", "visivel": true, "alinhamento": "center", "tamanhoFonte": "grande" },
      { "id": "cliente_telefone", "visivel": true, "alinhamento": "center", "tamanhoFonte": "media" },
      { "id": "equipamento", "visivel": true, "alinhamento": "center", "tamanhoFonte": "media" },
      { "id": "defeito", "visivel": true, "alinhamento": "center", "tamanhoFonte": "media" },
      { "id": "data_entrada", "visivel": true, "alinhamento": "left", "tamanhoFonte": "pequena" },
      { "id": "numero_os", "visivel": true, "alinhamento": "left", "tamanhoFonte": "pequena" }
    ]
  }'::jsonb,
  add column etiqueta_autorizada_config jsonb not null default '{
    "alturaMm": 80,
    "mostrarLogo": true,
    "campos": [
      { "id": "cliente_nome", "visivel": true, "alinhamento": "center", "tamanhoFonte": "media" },
      { "id": "cliente_telefone", "visivel": true, "alinhamento": "center", "tamanhoFonte": "pequena" },
      { "id": "produto", "visivel": true, "alinhamento": "center", "tamanhoFonte": "media" },
      { "id": "numero_serie", "visivel": true, "alinhamento": "left", "tamanhoFonte": "media" },
      { "id": "referencia", "visivel": true, "alinhamento": "left", "tamanhoFonte": "media" },
      { "id": "numero_os_autorizada", "visivel": true, "alinhamento": "left", "tamanhoFonte": "pequena" },
      { "id": "data_entrada", "visivel": true, "alinhamento": "left", "tamanhoFonte": "pequena" }
    ]
  }'::jsonb;
