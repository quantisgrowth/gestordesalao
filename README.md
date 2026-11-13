# Gestor de Salão

Gestão para barbearias e salões, com autenticação por e-mail e senha e consultas ao Supabase.

## Acessos

- `/login`: login real, botão mostrar/ocultar senha e recuperação por e-mail com Supabase Auth. O papel administrativo é verificado por `gs_is_platform_admin`.
- `/redefinir-senha`: nova senha e confirmação após abrir o link recebido por e-mail.
- `/admin` e `/admin/empresas`: área restrita ao administrador da plataforma, listagem real e criação transacional por `gs_create_organization`.
- `/app`: empresas ativas vinculadas ao usuário; troca explícita quando houver mais de um vínculo.
- `/app/clientes`: busca paginada, cadastro, edição e histórico básico para proprietário, gestor e recepção.
- `/app/profissionais` e `/app/servicos`: cadastro, edição, inativação e habilitações, restritos ao proprietário/gestor.
- `/app/configuracoes`: edição dos dados comerciais e das regras em formulários separados, restrita ao proprietário/gestor.
- `/app/agenda` e `/app/fila`: consulta dos registros da empresa selecionada, atualizada a cada 30 segundos.
- `/estabelecimento/:slug`: catálogo da função `gs_public_catalog`; depende de a página pública estar ativada no banco.
- `/aplicativos`, `/app/aplicativos` e `/estabelecimento/demo`: prévias identificadas com dados fictícios.

Os painéis reais não usam dados fictícios como fallback. Empresas sem registros mostram estados vazios; erros de consulta mostram opção de tentar novamente.

## Recuperação de senha

Em **Supabase → Authentication → URL Configuration**, configure:

- **Site URL**: `https://gestordesalao.lovable.app`
- **Redirect URLs**: `https://gestordesalao.lovable.app/redefinir-senha`

Adicione separadamente os endereços de desenvolvimento/preview se precisar recuperar senhas nesses ambientes. O envio usa `resetPasswordForEmail` com a origem atual e a rota `/redefinir-senha`. O usuário define e confirma a nova senha com `updateUser`; não são criadas senhas pelo administrador. Links inválidos/expirados permitem solicitar outro envio. A resposta ao envio não confirma se existe uma conta com aquele e-mail.

Os testes automatizados usam serviços simulados: não enviam e-mails e não alteram senhas reais. A entrega do e-mail e o fluxo completo precisam ser homologados com a configuração do projeto e a versão publicada.

## Cadastro de empresas

O administrador cadastra nome, slug, plano e e-mail de um gestor que já exista e esteja confirmado no Supabase Auth. A função cria a empresa, vínculo, configurações e assinatura em uma transação. O cadastro não cria usuários nem envia convites. Não há cobrança implementada.

Agenda e fila continuam somente leitura nesta etapa; reservas, chamadas e convites ainda precisam ser implementados.

## Ativação do pacote de cadastros

1. Revisar e aplicar [SQL 6 — cadastros](docs/sql/06_cadastros.sql), após os SQLs 1 e 2, no projeto Supabase correspondente. Os SQLs 1 e 2 não devem ser repetidos em uma instalação existente.
2. Usar [verificação de instalação](docs/sql/07_verificar_cadastros.sql) para conferir funções e permissões, sem alterar dados.
3. Publicar a versão atual no Lovable e homologar com usuários de duas empresas. O teste local não comprova a implantação na conta hospedada.

A conexão administrativa disponível durante esta entrega não tem permissão no projeto `hqluhoibwemluotgryur`. O SQL complementar foi preparado e testado localmente; não foi aplicado ao banco hospedado. Sem ele, a edição de dados/configurações usa os grants anteriores, mas os novos cadastros por RPC mostram erro de ativação em vez de simular sucesso.

O SQL 6 não muda a estrutura das tabelas nem libera escrita direta em `customers`: adiciona funções específicas de gravação, com autorização por empresa/papel, validação, comparação de versão e salvamento transacional das habilitações. Repetições com o mesmo ID e conteúdo não criam duplicatas. Nomes, telefone, preço e duração não alteram snapshots históricos. Inativação preserva registros referenciados.

O cadastro de profissional não cria nem altera seu usuário de login; contas e convites continuam separados. Slug e janela de chamada de 5 minutos não são editáveis. Telefones compartilhados são permitidos após alerta na interface; não foi criada unicidade que impeça famílias de compartilharem um número.

Todos os formulários mantêm a versão lida ao abrir. Se outro operador alterar o registro, a gravação é rejeitada para reabrir com dados atuais. Trocar de empresa desmonta os formulários abertos.

## Configuração e desenvolvimento

O `.env` contém apenas a URL e a chave **pública** do projeto. Pode ser sobrescrito por variáveis do ambiente de implantação ou por `.env.local`. Nunca usar `service_role`, senha ou chave secreta em uma variável `VITE_*`.

O banco precisa ter a estrutura, RLS e funções dos SQLs 1 e 2 já instaladas. O schema `gs_private` deve permanecer fora dos schemas expostos pela Data API. A autorização final de todas as consultas e do cadastro ocorre no banco via RLS/RPC; o guard de interface não substitui essas verificações.

```sh
npm install
npm run dev
```

Validação:

```sh
npx tsc --noEmit
npm run build
npm test
npm run lint
```

Os testes de componente cobrem gravação de cadastros, formatos de preço/telefone, falhas sem falso sucesso, telefone compartilhado, duplo envio, colunas permitidas, troca de empresa e erros sem fallback.

O teste local de PostgreSQL está em `scripts/test-cadastros.mjs`. Ele usa PGlite (`@electric-sql/pglite`), exige `GS_FOUNDATION_SQL_DIR` apontando para os SQLs 1 e 2 entregues e aceita módulos locais por `PGLITE_MODULE_PATH` / `PGLITE_BTREE_GIST_PATH`. As fixtures rodam em banco efêmero, nunca conectado à produção. Cobre papéis, duas empresas, reenvio, validação, versões obsoletas, atomicidade e preservação de vínculos ao inativar.

Esses testes Eles não substituem testes autenticados de isolamento entre duas empresas reais. A sessão não é acessada no servidor; conteúdo privado é carregado no navegador com o JWT do usuário, sem credenciais privilegiadas.

## Tipografia

Fonte de sistema com prioridade para `-apple-system` / `BlinkMacSystemFont` (San Francisco em dispositivos Apple) e alternativas nativas em Windows e Android. Títulos e corpo usam a mesma família. Não há download de fontes da Apple nem dependência de Google Fonts.

## Lovable

[Aplicação](https://gestordesalao.lovable.app) · [Editor](https://lovable.dev/projects/618b6f41-10b3-4d41-a902-8dd355b2fca4).

As alterações na branch conectada sincronizam com o editor. A versão pública depende da publicação pelo Lovable.
