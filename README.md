# Gestor de Salão

Gestão para barbearias e salões, com autenticação por e-mail e senha e consultas ao Supabase.

## Acessos

- `/login`: login real, botão mostrar/ocultar senha e recuperação por e-mail com Supabase Auth. O papel administrativo é verificado por `gs_is_platform_admin`.
- `/redefinir-senha`: nova senha e confirmação após abrir o link recebido por e-mail.
- `/admin` e `/admin/empresas`: área restrita ao administrador da plataforma, listagem real e criação transacional por `gs_create_organization`.
- `/app`: empresas ativas vinculadas ao usuário; troca explícita quando houver mais de um vínculo.
- `/app/agenda`, `/app/fila`, `/app/profissionais`, `/app/servicos`, `/app/configuracoes`: consulta dos registros da empresa selecionada, atualizada a cada 30 segundos.
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

Agenda e fila são somente leitura nesta etapa. Cadastros de serviços/profissionais, edição de configurações, reservas, chamadas e convites ainda precisam ser implementados. Os botões correspondentes permanecem desabilitados.

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

Os testes de componente cobrem troca de empresa e erros sem fallback. Eles não substituem testes autenticados de isolamento entre duas empresas reais. A sessão não é acessada no servidor; conteúdo privado é carregado no navegador com o JWT do usuário, sem credenciais privilegiadas.

## Tipografia

Fonte de sistema com prioridade para `-apple-system` / `BlinkMacSystemFont` (San Francisco em dispositivos Apple) e alternativas nativas em Windows e Android. Títulos e corpo usam a mesma família. Não há download de fontes da Apple nem dependência de Google Fonts.

## Lovable

[Aplicação](https://gestordesalao.lovable.app) · [Editor](https://lovable.dev/projects/618b6f41-10b3-4d41-a902-8dd355b2fca4).

As alterações na branch conectada sincronizam com o editor. A versão pública depende da publicação pelo Lovable.
