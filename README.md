# TZCG React

Biblioteca React + TypeScript para comparar horários atuais de cidades e aeroportos, com uma Lista e um Grid de 24 horas. Totalmente offline durante o uso, sem backend nem chave de API.

## Desenvolvimento

Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run build:demo
npm pack
```

A demo é separada do código da biblioteca e não entra no pacote npm. Pacote: `tzcg-react`, versão inicial `0.1.0`. A disponibilidade do nome foi consultada no npm durante a preparação. Repositório: [devmarjo/TZCG](https://github.com/devmarjo/TZCG). Instruções de publicação em `outputs/PUBLICACAO.md`.

## Uso

Instale via npm após a publicação (ou use o arquivo `.tgz` local antes dela):

```sh
npm install tzcg-react
```

```tsx
import { TimeZoneWidget, searchLocations } from 'tzcg-react';
import 'tzcg-react/styles.css';

const airport = searchLocations('GRU')[0];

export function App() {
  return <TimeZoneWidget initialLocations={[airport]} />;
}
```

`TimeZoneWidget` aceita:

| Prop | Uso |
| --- | --- |
| `initialLocations` | Locais iniciais quando não há lista salva válida; o local da máquina é incluído separadamente. |
| `storageKey` | Chave do localStorage, padrão `tzcg:locations:v1`. Use uma chave própria por instância/lista ou `null` para desativar. |
| `initialView` | `list` (padrão) ou `grid`. |
| `catalog` | Catálogo alternativo para a busca offline. |
| `locale` | Formatação das datas, padrão `pt-BR`. Os textos da interface são em português. |
| `onLocationsChange` | Recebe os locais após adição, exclusão ou reordenação, sem o local da máquina. |
| `onOrderChange` | Recebe a ordem dos IDs, incluindo `__local` para o local da máquina. Esse ID é reservado. |
| `className` | Classe adicional no componente. |

Cada `Location` usa `id`, `name`, `timeZone` (IANA), e opcionalmente `country`, `region`, `iata`, `airport`, `aliases`. A API também exporta `locations` e `searchLocations(query, limit?, catalog?)`.

## Comportamento

- Detecta o fuso informado por `Intl.DateTimeFormat().resolvedOptions().timeZone`, após montar no cliente. Não usa geolocalização e não conhece a cidade física exata: o nome do item local deriva da zona configurada na máquina.
- Recalcula os horários a partir do mesmo instante. O relógio da máquina é a referência; não há sincronização com servidor.
- Zonas que o ambiente não reconhece são excluídas da busca, em vez de apresentar uma conversão incorreta. Por exemplo, navegadores antigos podem não reconhecer zonas IANA recentes.
- Usa `Intl` e as regras IANA disponíveis no navegador/sistema, incluindo horário de verão. Para regras atualizadas, o navegador/sistema precisa estar atualizado.
- A Lista tem duas colunas: cidade/fuso e hora local. O local da máquina não pode ser excluído, mas pode ser reordenado. A busca adiciona ao fim e impede o mesmo ID duplicado. Os resultados são flutuantes e não aumentam a altura do widget.
- O Grid mostra uma janela de 24 horas contínuas, alinhada pelo fuso local. As horas locais podem saltar ou repetir durante transições de horário de verão; os títulos das células incluem data e offset.
- A janela inicia na hora obtida ao subtrair a hora local atual do instante atual. Em dias de transição no fuso de referência, o primeiro rótulo pode ser 23h ou 01h; não se força um dia civil de 24 horas.
- A linha vermelha representa o instante atual e sua posição fracionária na hora. A rolagem inicial mostra a região do horário atual; é possível explorar as demais horas horizontalmente.
- Dia: **06:00 inclusive a 18:00 exclusive**, noite: o restante. São faixas ilustrativas de 12 horas locais, sem astronomia. Fusos fracionários podem apresentar células com duas cores.
- As linhas podem ser reordenadas pela alça à esquerda com mouse ou toque; pelo teclado, foque a alça e use ↑/↓. A ordem é preservada entre Lista e Grid. O X entre cidade e horário exclui locais adicionados; o local da máquina não tem X.
- Salva automaticamente locais adicionados, exclusões e ordem no `localStorage`. Ao recarregar, a lista salva substitui `initialLocations`, inclusive quando todos os locais adicionais foram removidos. Salva a posição de `__local`, mas detecta novamente o fuso da máquina; não persiste a hora atual. A aba ativa não é persistida.
- Use `storageKey` diferente para listas independentes no mesmo domínio. A leitura ocorre no cliente após montar, preservando SSR. Dados inválidos ou de versão desconhecida usam os locais iniciais; entradas inválidas e duplicadas são descartadas. Se o armazenamento estiver bloqueado ou cheio, o widget continua funcionando na sessão. Os callbacks continuam disponíveis para integração.
- SSR: renderiza um estado inicial de detecção para evitar discrepância entre fuso do servidor e do cliente.

## Dados e licença

Código MIT. Cidades derivadas do GeoNames, sob CC BY 4.0; aeroportos do OurAirports, domínio público. Consulte `THIRD_PARTY_NOTICES.md` e `outputs/DADOS.json`.

O catálogo inicial contém 34.155 cidades do conjunto `cities15000` e 65 aeroportos de uma seleção explícita, com zonas IANA atribuídas no script. Não é um catálogo completo de aeroportos ou de todas as cidades. Códigos de região do GeoNames são preservados como códigos, não como nomes traduzidos. Busca ignora acentos e aceita nomes originais, transliteração ASCII, país, região, zona IANA e IATA presente na seleção.

Para regenerar os dados (rede necessária apenas nesta etapa):

```sh
python3 scripts/build-data.py
```

## Distribuição

O build produz ESM, CommonJS, tipos TypeScript e CSS. React e React DOM são peers, não ficam embutidos. O pacote é gratuito e redistribuível conforme as licenças indicadas. A publicação usa a conta npm autorizada e o nome disponível no momento do envio; `npm pack` permite revisar e usar localmente antes de publicar.

## Qualidade e releases

`npm run check` verifica tipos, testes e build. `npm run check:package` verifica os arquivos distribuídos. O CI executa a validação com React 18 e 19. O workflow de publicação responde a uma release GitHub com tag `v<versão>`, após configurar Trusted Publishing no npm. Instruções completas em `outputs/PUBLICACAO.md`.
