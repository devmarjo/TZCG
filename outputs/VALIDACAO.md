# Validação da versão 0.1.0

- TypeScript: sem erros.
- Vitest: 15 testes aprovados, em 3 arquivos.
- Casos: salto e repetição de hora no horário de verão; meia hora e 45 minutos; virada de data; posição fracionária da linha; cores em células parciais; busca sem acentos/IATA; duplicatas; zonas não suportadas; interação e abas por teclado.
- Build: ESM, CommonJS, declarações TypeScript e CSS gerados.
- Tarball testado em consumidor separado: imports ESM/CommonJS, tipos em .mts/.cts e SSR aprovados.
- Chromium: desktop e celular 390px, sem erros de página ou overflow horizontal da página; Grid tem rolagem própria.
- Busca IATA com contexto de navegador offline: aprovada.
- npm audit: 0 vulnerabilidades nas dependências instaladas no momento da verificação.

## Limitações desta versão

- Catálogo de aeroportos limitado a 65 entradas; cidades derivadas de cities15000.
- Regras de fuso dependem da versão de Intl/ICU do navegador/sistema. Zonas não reconhecidas são omitidas da busca.
- Catálogo offline aumenta o bundle: demo aproximadamente 4,36 MB sem compressão e 0,88 MB gzip; pacote instalável cerca de 1,6 MB.
- Nome npm provisório; nenhuma publicação realizada.
- Sem entrada manual de horários ou cálculo de duração de voo.
- Resultados flutuantes sem alteração de altura, exclusão, local protegido e reordenação compartilhada verificados no Chromium com mouse e toque; teclado verificado nos testes. Detalhes em VALIDACAO-INTERACOES.json.

Capturas e detalhes do browser em outputs/. Dados de origem e hashes em DADOS.json. O código está na pasta TZCG escolhida pelo usuário.

## Persistência

Lista, ordem, exclusões e lista vazia restauradas após reload real no Chromium. Busca e gravação também verificadas com a rede desligada após carregar a aplicação. Fuso local redetectado em outro ambiente; chave de armazenamento isolada, dados inválidos e armazenamento bloqueado verificados. Detalhes em VALIDACAO-STORAGE.json.
