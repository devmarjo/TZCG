# Fontes e licenças

## Código TZCG

Licença MIT no arquivo LICENSE. Essa licença cobre o código do projeto; os dados de terceiros mantêm suas condições.

## GeoNames

Autor/fonte: GeoNames — https://www.geonames.org/

Dados: https://download.geonames.org/export/dump/cities15000.zip

Termos e formato: https://download.geonames.org/export/dump/

Licença: Creative Commons Attribution 4.0 International (CC BY 4.0) — https://creativecommons.org/licenses/by/4.0/ e texto legal https://creativecommons.org/licenses/by/4.0/legalcode

Adaptações: seleção dos campos de identificador, nome, transliteração ASCII, país, região e zona IANA; transformação para JSON, ordenação por população e exclusão de entradas sem zona. Atribuição mantida neste arquivo e na interface. Ao redistribuir os dados, preserve a atribuição e a licença, indicando alterações. Nenhum endosso do GeoNames é implícito. Os dados são fornecidos sem garantia de completude ou exatidão.

## OurAirports

Autor/fonte: OurAirports e seus colaboradores — https://ourairports.com/data/

CSV: https://davidmegginson.github.io/ourairports-data/airports.csv

Dicionário: https://ourairports.com/help/data-dictionary.html

Licença: domínio público, conforme declaração da fonte. Não se utiliza um dataset proprietário da IATA. Os códigos IATA são campos do catálogo público do OurAirports.

Adaptações: seleção de 65 aeroportos, nomes, municípios, países, regiões e códigos IATA. A associação desses aeroportos a zonas IANA é uma seleção explícita no script do TZCG; o OurAirports não fornece esses fusos no CSV. A cobertura é limitada à seleção documentada no script.

## Regras IANA

Fonte: https://www.iana.org/time-zones e https://www.iana.org/time-zones/tz-link

A base tz é de domínio público. O TZCG não redistribui uma cópia própria das regras: utiliza o Intl/ICU do ambiente. Não utiliza offsets fixos como substituto das regras de horário de verão.

## Registro

O arquivo outputs/DADOS.json registra momento do download, contagens e hashes SHA-256 dos arquivos de origem para esta versão. Alterações futuras nas fontes só chegam ao catálogo ao regenerá-lo e distribuir nova versão; regras de conversão dependem da versão de Intl do ambiente.
