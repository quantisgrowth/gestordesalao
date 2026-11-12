# Gestor de Salão - SaaS multiempresa e aplicativos (v0.3)

## Mudança de marca e escopo

Nome atual: **Gestor de Salão**. Substitui Cadence na interface e nos metadados atuais. Documentos anteriores são históricos.
Mantidos o slogan “Seu negócio no ritmo certo.”, a paleta grafite/menta e as fontes Sora/Inter. O monograma passa a ser GS.

O conceito multiempresa já existia no PRD 1.3. Esta entrega explicita a administração global, separa a visão do salão e apresenta os aplicativos do cliente e do gestor dentro da web.

## Entrega visual

| Rota                  | Público / função    | O que está disponível                                                      |
| --------------------- | ------------------- | -------------------------------------------------------------------------- |
| /aplicativos          | Showroom público    | Dois celulares navegáveis: cliente e gestor; comparação e visão individual |
| /app/aplicativos      | Gestor do salão     | O mesmo showroom dentro do painel                                          |
| /admin                | Admin da plataforma | Empresas, situação de ativação e visão do fluxo de acesso                  |
| /admin/empresas       | Admin da plataforma | Busca, detalhes e cadastro local demonstrativo de uma empresa              |
| /app                  | Empresa de exemplo  | Painel operacional visual, preservado                                      |
| /estabelecimento/demo | Cliente             | Página pública do estabelecimento fictício                                 |

Todos os dados são fictícios. Nenhum cadastro gera conta, senha, convite, cobrança ou permissão real.
O cadastro de empresa existe apenas em memória durante a visita à área administrativa e é perdido ao recarregar.
Os aplicativos são componentes responsivos dentro de molduras de celular; não são apps nativos nem uma PWA instalável nesta entrega.
As rotas de admin estão públicas apenas por serem demonstrações com dados fictícios. A publicação com empresas reais exige autenticação e autorização no servidor.

## Modelo de acesso a implementar

- **Admin da plataforma**: cria e gerencia organizações, plano, situação e convite do primeiro gestor. Não é um papel escolhido na interface pelo usuário.
- **Gestor/proprietário**: configura e opera sua organização. Pode também ser profissional usando o mesmo login.
- **Recepção**: opera a unidade conforme permissão; não administra o SaaS.
- **Profissional**: acessa suas operações autorizadas dentro da empresa.
- **Cliente**: acessa serviços públicos e seus próprios agendamentos por acesso restrito.

Não tratar “administrador do salão” como “administrador da plataforma”.

## Provisionamento real recomendado

1. O admin autenticado solicita o cadastro de uma organização e do e-mail do gestor.
2. Uma operação restrita no servidor verifica o papel global e valida nome, identificador e plano.
3. Organização, vínculo e convite têm identificadores próprios, trilha de auditoria e proteção contra repetição.
4. Se o e-mail já pertence a uma conta, adicionar vínculo autorizado; não criar contas duplicadas nem redefinir a senha de um usuário existente.
5. O gestor recebe convite de uso único, com expiração, e define sua própria senha.
6. O vínculo é ativado após validação do convite. Sessão e organização ativa são verificadas no servidor em todas as operações.
7. Falhas parciais de cadastro/convite são registradas e podem ser retomadas sem duplicar organização ou usuário.

O admin não consulta nem armazena senhas de usuários. Credenciais privilegiadas permanecem no servidor.
Não incluir senha em logs, URLs, e-mails de apresentação, tabelas de empresas ou código do navegador.
Envio real de convite/e-mail e integração de autenticação não foram implementados nesta rodada.

## Estrutura lógica (proposta, sem migration executada)

- organizations: identidade, slug único, situação operacional e dados comerciais da empresa.
- memberships: user_id, organization_id, papéis, situação e restrições de acesso.
- platform_admins: vínculo global protegido, distinto dos papéis da organização.
- organization_invitations: convite com hash do token, destinatário, expiração, estado e auditoria.
- plans / subscriptions: seleção de plano e situação contratual; não habilitar cobrança nesta etapa.
- professionals, services, customers, appointments, queue_entries, settings, audit_logs: organização obrigatória.
- Conteúdo público e métricas agregadas: respostas mínimas, sem nomes de clientes ou contatos.

Os tipos centrais da demonstração recebem organizationId para evidenciar o domínio dos registros.
Isso não implementa isolamento de banco. O backend precisará impor isolamento por organização, inclusive por API e relacionamentos, e não apenas filtrar a interface.

## Critérios de aceite antes de empresas reais

- A empresa A não lê, altera, exporta ou assina eventos da empresa B, inclusive por acesso direto à API e troca de IDs.
- Um gestor não se promove a admin da plataforma nem altera seu organization_id por formulário.
- Referências a profissional, serviço, cliente e agendamento sempre pertencem à organização autorizada.
- Uma conta com mais de um vínculo troca de organização de forma explícita; dados em cache são segregados.
- Conta suspensa não executa operações; a suspensão não apaga o histórico.
- Convites expiram, não podem ser reutilizados e não revelam contas existentes para pessoas sem autorização.
- Reservas e chamadas simultâneas são atômicas.
- Cliente não acessa dados de terceiros; a consulta pública mostra apenas agregados.
- Senhas nunca aparecem no cadastro administrativo; recuperação e criação são protegidas.
- App do cliente e do gestor usam os mesmos serviços autorizados do web, sem duplicar regras de agenda/fila.

## Sequência seguinte

1. Homologar marca, showroom e cadastro administrativo demonstrativo.
2. Conectar a autenticação e estruturar organizações, vínculos e admin global pelo Lovable.
3. Implementar provisionamento de empresa/gestor e convites no servidor, com testes entre organizações.
4. Persistir cadastros e políticas; depois implementar agenda, fila e tempo real.
5. Validar com empresas-piloto antes de cobrança ou aplicativos nativos.

Regras operacionais continuam: chamada 5 min, buffer inicial 5 min configurável, atraso 10 min configurável, cancelamento/remarcação até 2h configurável e pausa sem transferência automática.

## Validação local desta entrega

- TypeScript do código da aplicação a partir de src/router.tsx: zero diagnósticos (excluindo dependências de testes indisponíveis).
- Resolução de rotas verificada para /, /app, /aplicativos, /app/aplicativos, /admin e /admin/empresas.
- Renderização React no servidor verificada para os dois aplicativos e a administração de empresas.
- Registros fictícios de profissionais, serviços, reservas e fila verificados com organizationId da empresa de exemplo.
- Rotas geradas pelo gerador oficial do TanStack, preservando o registro do TanStack Start.
- Build local bloqueado por enhanced-resolve indisponível. A instalação de dependências continua limitada pelo ambiente sem rede.
- Os testes de renderização usaram um carregador TypeScript temporário e dependências locais compatíveis recuperadas do cache; isso não equivale ao build integral do lockfile.
- Brand Book: 12 páginas renderizadas e inspecionadas visualmente.
- A verificação no navegador será feita na publicação; nenhum desses testes comprova autenticação ou isolamento real de banco.
