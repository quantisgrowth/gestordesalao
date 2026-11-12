# Cadence — Gestor de Salão

Fundação visual de uma plataforma para barbearias e salões que combinam agendamentos e fila presencial.

Esta versão é uma demonstração: os dados são fictícios, as configurações não são salvas e as operações de atendimento estão desabilitadas. Ainda não há integração com banco de dados.

## Explorar

- `/`: apresentação.
- `/login`: prévia do acesso.
- `/app`: resumo do cenário.
- `/app/agenda`: agenda por profissional.
- `/app/fila`: fila e aba de recepção/tablet.
- `/app/profissionais` e `/app/servicos`: equipe e catálogo.
- `/app/configuracoes`: modalidades e políticas operacionais.
- `/estabelecimento/demo`: consulta pública e diálogo de prévia de agendamento.

[Plano de correção e próximos critérios de aceite](docs/plano-correcao-fundacao-v0.2.md).

## Desenvolvimento

Projeto React, TypeScript, TanStack Start e Tailwind CSS, conectado ao Lovable.

```sh
npm install
npm run dev
```

Verificação:

```sh
npm run build
npx tsc --noEmit
npm test
npm run lint
```

Os dados fictícios ficam em `src/data/demo.ts`. Não editar manualmente `src/routeTree.gen.ts`.
Mudanças no esquema de banco e em arquivos gerados seguem as regras de [AGENTS.md](AGENTS.md).

## Lovable

[Aplicação publicada](https://gestordesalao.lovable.app) · [Editor](https://lovable.dev/projects/618b6f41-10b3-4d41-a902-8dd355b2fca4).

Alterações na branch conectada sincronizam com o Lovable. Revisar e homologar esta versão antes de promover as mudanças para essa branch.
