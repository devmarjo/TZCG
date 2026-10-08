# Publicação TZCG

## Preparado

- Biblioteca `tzcg-react@0.1.0`, pública e gratuita, código MIT.
- ESM, CommonJS, declarações TypeScript e CSS separado.
- React e React DOM são peers; a demo não entra no pacote.
- CI para React 18 e 19 em `.github/workflows/ci.yml`.
- Publicação a partir de release GitHub em `.github/workflows/publish.yml`.
- Catálogo offline e licenças incluídos no pacote, com verificação automática do conteúdo.
- Conta npm identificada: `marjo.dev`. O nome `tzcg-react` não foi encontrado no registro na consulta desta preparação; isso não reserva o nome.

## GitHub

Repositório existente: https://github.com/devmarjo/TZCG — conta autenticada e destino verificados. `origin`, `repository`, `homepage` e `bugs` apontam para esse projeto. O histórico inicial existente é preservado.

## Primeira publicação npm

Na pasta do projeto, com Node 22.12+ para as ferramentas:

```sh
npm ci
npm run check
npm run check:package
npm publish --dry-run --ignore-scripts
npm publish --access public
```

O comando final publica de fato. O npm pode exigir verificação da conta/2FA. Não inserir tokens em arquivos versionados. Depois de publicar, confirmar `npm view tzcg-react@0.1.0` e testar a instalação pelo nome em um consumidor separado.

## Publicações futuras via GitHub

Depois da primeira publicação, configurar Trusted Publishing nas configurações do pacote npm: usuário `devmarjo`, repositório `TZCG` e workflow `publish.yml`. O workflow utiliza Node 24, OIDC, `id-token: write` e proveniência; não depende de `NPM_TOKEN` no repositório.

Atualizar a versão com `npm version patch` (ou minor/major conforme a mudança), enviar commit/tag e criar uma release GitHub com tag exatamente igual a `v<versão do package.json>`. O workflow verifica essa correspondência antes de publicar.

Uma versão publicada no npm não pode ser reutilizada. As condições e etapas atuais estão documentadas em [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/), [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) e [proveniência](https://docs.npmjs.com/generating-provenance-statements/).

## Pacote versus ferramentas

O pacote permite Node >=18 para consumidores e navegadores modernos com Intl. As ferramentas de desenvolvimento/testes exigem Node 22.12+; `.nvmrc` registra o runtime validado neste projeto.
