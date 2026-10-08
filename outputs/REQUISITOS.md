# TZCG — Time Zone Calculator & Grid

Projeto em `/Users/marjo/ITS_WORK/MARJO/TZCG/`.

## Escopo confirmado

- Biblioteca React + TypeScript gratuita para npm e reutilizável em vários projetos, incluindo o Portal do Consolidador.
- Sem backend, chave de API ou consultas online durante o uso. Dados incluídos na distribuição.
- Interface responsiva e compacta, com título curto e abas Lista e Grid na mesma faixa superior, espaçamento reduzido nas linhas e controles.
- Horário local obtido do navegador/máquina, associado à zona IANA informada pelo ambiente; pode ser arrastado para reordenar, mas não excluído.
- Lista: cidade com fuso abaixo; hora atual local. X entre cidade e hora para excluir locais adicionados. Novas cidades são adicionadas ao fim.
- Resultados da busca flutuantes, sem alterar a altura do componente.
- Reordenação por arraste com mouse/toque e setas do teclado na alça; ordem compartilhada entre Lista e Grid.
- Persistência automática da lista e ordem no localStorage, incluindo exclusões e posição do local; restauração ao recarregar. O fuso local é detectado novamente no navegador.
- Chave de armazenamento configurável por instância, com opção de desativar para integrações da biblioteca.
- Grid: preserva os locais da Lista; linhas de cidades/fusos e 24 colunas de horas alinhadas pelo mesmo instante. Cada célula mostra a hora local em formato 24h.
- Linha vermelha vertical no instante atual, considerando a porcentagem decorrida dentro da hora.
- Cores ilustrativas com 12 horas de dia e 12 horas de noite por horário local, sem nascer/pôr do sol real.
- Regras IANA da data atual para horário de verão, incluindo horas que saltam ou se repetem no Grid.
- Busca offline de cidades e aeroportos, incluindo códigos IATA quando disponíveis no catálogo.

## Decisões de implementação

- Dia das 06h às 18h; noite das 18h às 06h. Células de fusos fracionários podem apresentar duas cores.
- Conversão via Intl do navegador/sistema. Não é necessário baixar regras em runtime. Zonas não reconhecidas pelo ambiente são excluídas da busca.
- Catálogo GeoNames cities15000: 34.155 cidades. Seleção OurAirports: 65 aeroportos com associação explícita a zonas IANA.
- MIT para o código, CC BY 4.0 para dados GeoNames e domínio público para OurAirports; atribuições em THIRD_PARTY_NOTICES.md e na interface.
- Demo local separada da distribuição do pacote.
- Nome provisório do pacote: tzcg-react; disponibilidade no npm ainda não verificada.

## Fora da versão inicial

- Cálculo de duração de voo.
- Consulta e entrada de outras datas e horários, substituindo o requisito inicial de conversão manual.
- Cálculo astronômico de amanhecer/entardecer.

## Distribuição e organização

`outputs/`: documentos, provas de validação e pacote revisável. `work/`: arquivos intermediários.

A publicação efetiva no npm será realizada após escolher o nome e dispor de autorização/conta. A versão inicial é entregue localmente como pacote instalável para revisão.
