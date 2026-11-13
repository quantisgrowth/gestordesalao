# Gestor de Salão — Auditoria funcional e plano de implementação v0.4

> Atualização: o primeiro pacote foi implementado no código. Consulte a [entrega v0.5 e as pendências de ativação](entrega-cadastros-v0.5.md). O inventário abaixo preserva a base auditada no commit indicado.

**Data:** 13/11/2026. **Base de código:** `quantisgrowth/gestordesalao`, commit `90083524b8f1e47cad08d749d190a2cac190cbcb`.

**Situação:** comparação por módulo entre o código atual, a estrutura de 30 áreas e os trechos recuperados da pesquisa “Funcionalidades SaaS Barbearia”, o PRD MVP 1.3 aprovado e os SQLs de fundação entregues. A pesquisa foi recuperada de forma resumida, sem todos os subitens literais. A comparação das 30 áreas está na seção 10; não se afirma uma cobertura integral de cada subfuncionalidade da resposta original.

## 1. Diagnóstico executivo

O produto tem interface, autenticação, estrutura multiempresa e consultas ao banco. Ainda não tem o fluxo operacional completo de uma barbearia. Tela, tabela e funcionalidade utilizável são entregas diferentes.

Os problemas relatados por Felipe foram confirmados por inspeção do código:

- **Clientes:** existe a tabela e uma consulta interna de nomes; não há rota, menu ou formulário de cadastro de clientes.
- **Serviços:** a lista consulta o banco, mas o botão “Novo serviço” está explicitamente desabilitado. Não há formulário nem gravação.
- **Configurações:** a página apresenta listas de valores, sem campos editáveis, formulário ou ação de salvar.
- **Profissionais:** o botão de adicionar também está desabilitado.
- **Agenda e fila:** consultam os registros, mas os botões de criar, registrar chegada e operar atendimentos continuam desabilitados.

Essas pendências foram mantidas na entrega de integração de leitura. Não são resolvidas apenas publicando novamente ou alterando permissões no navegador. Precisam de implementação de formulários, operações autorizadas, atualização das consultas e testes.

**Primeira prioridade:** concluir clientes, serviços, profissionais e configurações; em seguida horários e bloqueios, agenda e fila. Expansões comerciais dependem dessa base.

## 2. Fontes e limites da auditoria

1. Pesquisa “Funcionalidades SaaS Barbearia”: lista das 30 áreas e trechos de requisitos recuperados da resposta de 13/11/2026. Não foi usado o resumo de PRDs antigos como substituto dessa pesquisa.
2. Código local correspondente à branch `main`, cuja versão atual foi conferida no GitHub.
3. PRD `Cadence_PRD_MVP_1_3_Regras_Operacionais.docx`, documento aprovado em 12/11/2026; o nome atual do produto é Gestor de Salão.
4. SQLs entregues: estrutura, políticas e funções. Eles indicam o desenho preparado; não constituem uma nova inspeção autenticada do banco de produção nesta auditoria.
5. Testes existentes no repositório: rotas, proteção administrativa, limpeza de cache ao sair, troca de empresa e recuperação de senha com serviços simulados.

Não houve nesta auditoria login com as contas de Felipe/gestor, alteração de dados reais ou teste de entrega de e-mail. Publicação no Lovable, configuração de redirecionamento de recuperação, isolamento entre duas empresas e concorrência de atendimentos ainda precisam de homologação completa. Os 14 testes da entrega anterior não provam esses fluxos em produção.

**Legenda:** “implementado no código” não equivale a “homologado em produção”; “parcial” indica que falta parte essencial da jornada; “estrutura preparada” indica tabelas/regras nos SQLs, sem funcionalidade completa na interface.

## 3. Inventário do que existe e do que falta

| ID  | Área                     | Evidência atual                                                     | O que falta                                                                         | Situação                                |
| --- | ------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| A01 | Login e saída            | Supabase Auth, sessão e guard de acesso                             | Homologar sessão, expiração e saída no ambiente publicado                           | Implementado no código                  |
| A02 | Visualização da senha    | Botão mostrar/ocultar no login e nova senha                         | Conferência visual nos dispositivos do piloto                                       | Implementado no código                  |
| A03 | Recuperação de senha     | Solicitação de link e rota de nova senha/confirmar                  | Conferir Redirect URLs, entrega do e-mail e fluxo real                              | Implementado; homologação pendente      |
| A04 | Empresas                 | Admin lista e cria por RPC com nome, slug, plano e gestor existente | Editar situação/plano, convidar/criar acessos e gerenciar responsáveis              | Parcial                                 |
| A05 | Multiempresa             | Vínculos, seleção da empresa e cache por usuário/empresa            | Testes reais de RLS e revogação/suspensão, inclusive API direta                     | Parcial; isolamento não homologado aqui |
| A06 | Papéis da equipe         | Papéis e políticas nos SQLs                                         | Expor permissões ao contexto, limitar ações por papel e gerenciar equipe            | Parcial                                 |
| A07 | Clientes                 | Tabela e consulta interna de id/nome                                | Menu, lista, busca, cadastro, edição e histórico básico                             | Ausente na interface                    |
| A08 | Serviços                 | Lista real de nome, duração e preço                                 | Criar, editar, inativar e vincular profissionais                                    | Somente leitura                         |
| A09 | Profissionais            | Lista real e disponibilidade informada no banco                     | Criar, editar, inativar, vincular acesso e serviços                                 | Somente leitura                         |
| A10 | Horários de trabalho     | Tabela `working_hours` nos SQLs                                     | Editor por profissional/dia, múltiplos intervalos, folgas e validação               | Estrutura preparada                     |
| A11 | Bloqueios                | Tabela `time_blocks` nos SQLs                                       | Criar, editar/remover com controle; tratar reservas afetadas                        | Estrutura preparada                     |
| A12 | Dados do estabelecimento | Nome, endereço, telefone e fuso exibidos                            | Formulário de edição e confirmação de persistência                                  | Somente leitura                         |
| A13 | Modalidades e políticas  | Leitura de filas, agenda online, buffer e tolerâncias               | Salvar alterações autorizadas e aplicar regras nas operações                        | Somente leitura                         |
| A14 | Agenda                   | Registros de hoje agrupados por profissional                        | Navegar dia/semana, filtros, reservar, remarcar, cancelar e operar estados          | Somente leitura                         |
| A15 | Fila                     | Registros ativos e preferência de profissional                      | Chegada presencial, chamada atômica, início/fim, ausência, desistência e prioridade | Somente leitura                         |
| A16 | Recepção/tablet          | Aba com registros e botões grandes                                  | Concluir ações de balcão e validar uso em tablet/celular                            | Parcial visual                          |
| A17 | Página pública           | Catálogo real via RPC, condicionado à ativação                      | Disponibilidade, reserva real e acompanhamento individual seguro                    | Parcial                                 |
| A18 | Previsão de espera       | Interface informa indisponibilidade no catálogo real                | Motor que considere serviços, reservas, pausas e buffers                            | Não implementado                        |
| A19 | Sincronização            | Consultas automáticas a cada 30 segundos                            | Realtime autorizado ou estratégia equivalente, reconexão e última atualização       | Parcial; não é Realtime                 |
| A20 | Auditoria                | Tabela e triggers básicos nos SQLs                                  | Visualização, cobertura das novas operações e razões das exceções                   | Estrutura preparada                     |
| A21 | Planos do SaaS           | Códigos Essencial/Profissional e assinatura vinculada               | Limites, funcionalidades por plano, cobrança, inadimplência e alteração de plano    | Parcial cadastral                       |
| A22 | Aplicativos              | Showroom mobile com exemplos identificados                          | Experiência operacional real; PWA/app nativo depende de fase própria                | Protótipo                               |
| A23 | Relatórios gerenciais    | Indicadores básicos do dia                                          | Períodos, produtividade, faltas, espera e exportação autorizada                     | Parcial                                 |
| A24 | Privacidade e operação   | RLS/auditoria no desenho; captura técnica de erros no código        | Homologar acesso, retenção, atendimento a solicitações, backups e contingência      | Parcial                                 |

Não há evidência de módulos completos de caixa, comissões, estoque, fidelidade, assinaturas de cortes, campanhas, automações de WhatsApp ou IA no código inspecionado. Essas áreas aparecem na pesquisa ampla e são tratadas como expansão planejada. A presença na pesquisa não as torna automaticamente obrigatórias no primeiro piloto.

## 4. Causas dos problemas relatados e correção necessária

| Problema                           | Causa observada                                                      | Dependência técnica                                                                                         | Entrega mínima e aceite                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Não consigo cadastrar cliente      | Não há módulo de clientes na navegação/rotas nem operação de criação | Os SQLs não concedem escrita direta em `customers`; criar operação restrita, com validação de empresa/papel | Cadastrar nome e telefone, salvar, recarregar e localizar o mesmo cliente; outra empresa não pode acessá-lo   |
| Não consigo cadastrar serviço      | Botão `disabled`; ausência de formulário/mutação                     | Os SQLs já preveem INSERT/UPDATE restritos a owner/manager; conferir instalação antes de integrar           | Criar/editar/inativar com preço em centavos e duração válida; registro permanece após recarregar              |
| Não consigo editar configurações   | Página construída com listas de consulta                             | UPDATE de colunas específicas já previsto para owner/manager; respeitar campos imutáveis                    | Salvar nome/endereço/telefone/fuso e políticas; reabrir confirma os valores; recepção/profissional não salvam |
| Não consigo adicionar profissional | Botão `disabled`; cadastro não implementado                          | Cadastro e vínculo com acesso são operações distintas; usuário vinculado precisa pertencer à empresa        | Criar profissional, vincular serviços, editar/inativar, preservar histórico                                   |
| Botões de agenda/fila não operam   | Ações ainda não implementadas                                        | Escrita direta nessas tabelas foi intencionalmente vedada nos SQLs; faltam operações transacionais          | Operações gravam uma vez, validam estado anterior e mantêm reservas e fila consistentes                       |

### Cuidados obrigatórios na primeira implementação

- Não habilitar botões antes de existir uma operação real e autorizada.
- Ler os papéis do vínculo da empresa selecionada; hoje o contexto consulta só `organization_id`. Esconder botões não substitui autorização no banco.
- Não usar `service_role` no navegador nem liberar escrita ampla para contornar erros.
- “Resposta à chamada” permanece em **5 minutos**: o SQL atual possui restrição fixa e não concede sua edição. Não apresentar esse campo como livremente editável sem uma nova decisão e mudança de regra.
- `slug` não tem atualização concedida no SQL atual. Se for editável no futuro, tratar unicidade e impacto nos links; não incluí-lo em um update comum de dados comerciais.
- Preservar serviços/profissionais usados em históricos; inativar em vez de apagar registros referenciados.
- Cadastro de profissional não cria automaticamente uma conta de login. Convites e vínculos de membros exigem fluxo próprio.
- Alterar preço/duração não deve reescrever os snapshots dos agendamentos existentes.
- Definir política de possível duplicidade de telefone antes de impor unicidade: telefones compartilhados podem existir. Normalizar para E.164 e alertar sobre correspondências.

## 5. Plano de execução com dependências e critérios de aceite

### Fase 0 — Confirmar a linha de base e preparar homologação

**Prioridade:** P0. **Dependência:** nenhuma.

| Tarefa | Entrega verificável                                                                                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P00.1  | Usar a matriz das 30 áreas (seção 10) como referência; complementar os subitens literais quando disponíveis e resolver conflitos com o PRD, sem bloquear os cadastros já diagnosticados |
| P00.2  | Conferir versão do GitHub, versão publicada do Lovable, projeto Supabase e configuração do link de recuperação                                                                          |
| P00.3  | Criar dados controlados de duas empresas e usuários de papéis diferentes, sem usar cadastros de clientes reais                                                                          |
| P00.4  | Conferir as permissões e funções instaladas e registrar divergências em relação aos SQLs entregues                                                                                      |
| P00.5  | Expor papéis/capacidades do vínculo no contexto e criar padrão comum de formulário, erros, estado salvando e atualização de consultas                                                   |

**Aceite:** ambiente de teste identificado; proprietário, recepção e profissional acessam somente o permitido; nenhum sucesso de gravação aparece antes da resposta do servidor.

### Fase 1 — Concluir os cadastros que estão impedindo o uso

**Prioridade:** P0. **Dependência:** fase 0. **Primeiro pacote de implementação recomendado.**

| Ordem / tarefa            | Escopo                                                                                                                                                     | Critério de aceite                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 / P01.1 Clientes        | Criar menu e `/app/clientes`; listar e buscar por nome/telefone; cadastro e edição; retorno de validação; possível duplicidade; histórico básico associado | Nome e telefone persistem; erro não cria duplicata; cliente fica disponível para agendamento/chegada da mesma empresa                                    |
| 2 / P01.2 Serviços        | Criar, editar, listar ativos/inativos; nome, duração, preço; vincular profissionais habilitados                                                            | Preço não sofre erro de conversão decimal; duração respeita limites; inativação impede novas seleções sem apagar histórico                               |
| 3 / P01.3 Profissionais   | Criar, editar/inativar e associar serviços; separar cadastro de pessoa do acesso ao sistema                                                                | Profissional só atende serviços habilitados; vínculo de login não pode apontar para membro de outra empresa                                              |
| 4 / P01.4 Estabelecimento | Editar nome, endereço, telefone e fuso; mostrar slug como consulta                                                                                         | Persistência confirmada após recarregar; fuso inválido é rejeitado; nenhuma mudança silenciosa de identificador                                          |
| 5 / P01.5 Configurações   | Editar filas, página pública, agenda online, buffer, tolerância e antecedências permitidas; manter chamada fixa em 5 min                                   | Valores válidos persistem; campo não permitido não é enviado; desligar modalidade impede novas operações nela quando o respectivo fluxo for implementado |

**Regra de entrega:** caso dados do estabelecimento e políticas sejam salvos em operações separadas, mostrar confirmações separadas. Nunca anunciar “tudo salvo” após sucesso parcial. Uma operação atômica é alternativa a avaliar.

**Aceite da fase:** gestor configura uma empresa sem executar SQL para cada cadastro; todos os fluxos persistem e respeitam empresa/papel. A fase não depende de financeiro, estoque, IA ou aplicativos nativos.

### Fase 2 — Horários, bloqueios e agenda operacional

**Prioridade:** P0. **Dependência:** fase 1.

- P02.1: horários por dia/profissional, intervalos de trabalho e pausas; editor para incluir/alterar/remover intervalos com autorização e auditoria.
- P02.2: bloqueios de um profissional ou da unidade; validar início/fim e informar reservas afetadas, sem cancelamento automático.
- P02.3: cálculo de disponibilidade com duração individual do serviço, habilitação, expediente, bloqueios, reservas, buffer, antecedência mínima e horizonte máximo.
- P02.4: agenda por dia/semana e filtros; criar e confirmar reserva em operação transacional e idempotente.
- P02.5: check-in, iniciar, finalizar, cancelar, remarcar e registrar falta, com transições e timestamps coerentes.
- P02.6: preservar vínculo entre reserva anterior e remarcação; manter preço/duração/buffer da reserva e histórico.

**Aceite:** duas tentativas simultâneas no mesmo profissional/horário produzem no máximo uma confirmação; horários fora do expediente/bloqueados não são oferecidos; recepção opera sem modificar configurações sensíveis. A restrição de sobreposição entre agendamentos existente não substitui checagens de bloqueios e conflitos com a fila.

### Fase 3 — Fila híbrida e recepção

**Prioridade:** P0. **Dependência:** fase 2.

- P03.1: chegada presencial com nome, telefone, serviço e preferência; reutilizar cliente existente quando apropriado.
- P03.2: manter uma única entrada ativa por cliente/empresa; separar fila específica do pool “qualquer disponível” sem duplicá-lo.
- P03.3: chamar o próximo elegível com atribuição atômica; impedir que dois profissionais chamem a mesma pessoa.
- P03.4: validar janela livre: serviço + buffer precisam caber antes da reserva/bloqueio seguinte. Agenda e fila compartilham a mesma proteção de capacidade.
- P03.5: iniciar/concluir; registrar desistência/ausência; contar 5 minutos de resposta à chamada. Ausência é manual após o prazo; reentrada cria posição ao final e preserva a anterior.
- P03.6: reordenar somente por proprietário/gestor ou recepção autorizada, com justificativa auditável; profissional isolado não ganha esse direito.
- P03.7: pausa/retorno do profissional; retirar capacidade imediatamente, preservar e sinalizar reservas afetadas.
- P03.8: terminar balcão/tablet com botões legíveis, confirmação de ações críticas e retorno claro de conexão.

**Aceite:** encaixe não invade reserva; uma pessoa não é atendida duas vezes; repetir clique não repete operação; fechar/reabrir a tela preserva os estados; duas telas observam a mesma ordem elegível.

### Fase 4 — Página do cliente, espera e sincronização

**Prioridade:** P0 para o escopo público aprovado; QR Code é P1. **Dependência:** fases 2 e 3.

- P04.1: publicar catálogo conforme configuração e somente serviços/profissionais elegíveis.
- P04.2: disponibilizar agendamento real pela página pública, com proteção contra abuso, validação e confirmação somente após sucesso no servidor.
- P04.3: permitir consultar/cancelar/remarcar reserva própria por acesso seguro; validar limite de 2 horas no servidor, não só esconder botões.
- P04.4: implementar previsão determinística considerando duração, início real, reservas, buffers, pausas e capacidade; mostrar indisponibilidade quando faltarem dados confiáveis.
- P04.5: sincronização autorizada de mudanças, reconexão, fallback e indicação da última atualização. Medir latência antes de prometer “tempo real”.
- P04.6: QR Code para a consulta pública; não usar QR como autorização automática para entrada remota na fila.

**Aceite:** visitante nunca vê nomes/telefones de clientes; nenhuma reserva é confirmada por uma simulação local; previsão indisponível não aparece como zero minuto; acompanhar a fila não permite entrar remotamente.

### Fase 5 — Administração, segurança e liberação do piloto

**Prioridade:** P0 para homologação; melhorias de gestão administrativa podem ser P1. **Dependência:** execução dos fluxos das fases anteriores.

- P05.1: convites com expiração, uso único, reenvio controlado e vínculo a empresa/papel; verificar acesso administrativo no servidor. Não armazenar senhas criadas pelo admin.
- P05.2: ativar/inativar membros e gerir papéis; impedir autopromoção e retirada do último proprietário sem sucessão autorizada.
- P05.3: alteração de situação/plano da empresa com auditoria; definir efeito da suspensão e preservação do histórico.
- P05.4: auditoria consultável, incluindo autor, entidade, horário, campos modificados e justificativa nas exceções; minimizar dados pessoais nos logs.
- P05.5: testar duas empresas por interface e API direta; testar sessão expirada, revogação de acesso, profissional e recepção, além de visitante/cliente.
- P05.6: privacidade, retenção, exclusão/anonimização conforme política definida; documentar backups, testar restauração e preparar contingência operacional.
- P05.7: testar concorrência de reserva, chamada e início de atendimento; repetição de requisição; desconexão e reconexão; fusos e virada do dia.
- P05.8: testar o fluxo publicado no celular/tablet/computador e realizar um dia completo de operação assistida.

**Aceite:** checklist do PRD 1.3 atendido e evidências registradas. Build/testes unitários são necessários, mas não bastam para liberar o piloto.

### Fase 6 — Expansão comercial, após estabilizar o núcleo

**Prioridade:** P1/P2 a dimensionar com os pilotos. **Dependência:** uso consistente das fases anteriores. Os nomes dos módulos correspondem à pesquisa; o agrupamento e a ordem de entrega abaixo são recomendações desta auditoria.

| Módulo candidato, ainda não implementado   | Escopo a dimensionar                                                              | Dependências / decisões antes de executar                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Caixa e comandas                           | Consumo de serviços/produtos, descontos, meios de pagamento, fechamento e estorno | Definir venda, caixa, permissões e conciliação; atendimento concluído não significa automaticamente receita recebida |
| Comissões                                  | Regras por serviço/profissional, descontos, estornos e repasses                   | Base confiável de vendas; decidir cálculo e momento de competência/pagamento                                         |
| Estoque e compras                          | Produtos, entradas/saídas, consumo por atendimento, fornecedores e alertas        | Catálogo de produtos e política de movimentação; separar produto vendido de insumo consumido                         |
| Relatórios                                 | Recebimento, produtividade, ocupação, faltas, tempo de espera e retenção          | Fontes e definições claras; acesso por papel; exportações autorizadas                                                |
| CRM e fidelidade                           | Histórico ampliado, preferências, retorno, campanhas e pontos                     | Política de acesso/retencão e opt-in de comunicação quando aplicável                                                 |
| WhatsApp e lembretes                       | Confirmação, lembrete, cancelamento e retorno                                     | Canal/provedor, custo, consentimentos aplicáveis, falhas e registro de entrega                                       |
| Planos de cortes e benefícios              | Pacotes, créditos, validade, uso e cancelamento                                   | Regras comerciais e de cobrança separadas da assinatura do SaaS                                                      |
| Cobrança do SaaS                           | Recorrência, troca de plano, limites, inadimplência e notificações                | Provedor, webhooks verificados, idempotência e política de bloqueio                                                  |
| Multiunidade                               | Visão de grupo e consolidação por unidade                                         | Confirmar se cada unidade é organização isolada ou filial de um grupo; não mudar o isolamento implicitamente         |
| PWA / aplicativos                          | Instalação, experiência do cliente/gestor e eventual push                         | Fluxos web completos; definir necessidade real de recursos nativos                                                   |
| IA e automações avançadas                  | Assistência de agenda, atendimento e análises                                     | APIs operacionais estáveis, limites de autonomia e confirmação das operações críticas                                |
| Site personalizado / Academy / marketplace | Conteúdo, personalização e novos canais                                           | Evidência de demanda; fora do núcleo operacional aprovado no MVP 1.3                                                 |

#### Sequência recomendada da expansão

| Onda / tarefas     | Entregas                                                                                                                                                                             | Dependências e aceite                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6A / P06.1–P06.4   | Comanda vinculada ao cliente/reserva, itens de serviço/produto e profissional; caixa por operador/turno; pagamentos divididos/parciais; descontos, gorjetas, estornos e comprovantes | Definir autorizações e aprovações antes de liberar descontos/estornos; atender não equivale a receber; fechamento confere saldos e mantém histórico                          |
| 6B / P06.5–P06.7   | Contas a pagar/receber, receitas/despesas, recorrências, conciliação, fluxo previsto/realizado; cálculo/apuração/aprovação de comissões; relatórios de operação e recebimento        | Exigir dados consistentes de vendas/pagamentos; comissão trata descontos, taxas, pacotes e estornos; separar competência, apuração e pagamento                               |
| 6C / P06.8–P06.10  | Catálogo de produtos/insumos e estoque por unidade, compras/recebimento/inventário; pacotes/créditos/clube de cortes; cobrança recorrente do SaaS                                    | Estoque tem trilha de movimentação e ajustes; pacotes têm consumo/saldo/validade; assinatura do clube e assinatura do SaaS são entidades distintas                           |
| 6D / P06.11–P06.14 | Comunicação e lembretes; lista de espera por vaga; CRM/retorno/fidelidade; avaliações e reclamações                                                                                  | Provedor/canal definido; tratar falhas/limites; vaga ofertada tem prazo e reserva temporária; avaliação sensível tem acesso restrito                                         |
| 6E / P06.15–P06.18 | Áreas completas do cliente/profissional; rotinas/metas da equipe; gestão SaaS e integrações; consolidação multiunidade                                                               | Cada área mostra apenas dados autorizados; cliente vê próprios créditos/comprovantes; profissional vê agenda e extrato próprio; grupo/unidade têm modelo explícito           |
| 6F / P06.19–P06.21 | PWA/app conforme necessidade; automações e IA; governança avançada de permissões/aprovações e integrações                                                                            | Permissões básicas já são obrigatórias desde a fase 0; a granularidade avançada cresce antes da ativação de cada módulo sensível; IA utiliza as mesmas operações autorizadas |

A lista de espera por vaga não é a fila presencial: registra serviço/profissional/período/flexibilidade, oferece a vaga compatível com prazo, controla reserva temporária e passa ao próximo se necessário. Não usar `queue_entries` para misturar esses dois processos.

A pesquisa também propõe custos/preços, fornecedores, código de barras, lotes/validade, perdas, consumo por serviço e transferências no estoque; e limites, benefícios, dependentes, pausas, renovação e inadimplência nos pacotes. Registrar esses subitens no detalhamento de P06.8/P06.9, sem considerá-los presentes porque existe um cadastro simples.

Não é recomendável implementar todos os candidatos antes de permitir os cadastros e concluir um atendimento real. Pagamentos, comissões, IA, app nativo e marketplace estavam explicitamente fora do MVP 1.3; sua entrada precisa ser uma decisão de produto, não consequência de existirem em uma lista ampla.

## 6. Matriz de permissões pretendida para o núcleo

Esta é a matriz-alvo para orientar a implementação; ela não descreve um editor de permissões já entregue. “Admin do salão” significa proprietário/gestor da empresa, diferente de administrador global da plataforma. Papéis acumulados somam capacidades autorizadas.

| Operação                                  | Admin plataforma                                                 | Proprietário                     | Gestor                                     | Recepção                       | Profissional                                      | Cliente / visitante                                     |
| ----------------------------------------- | ---------------------------------------------------------------- | -------------------------------- | ------------------------------------------ | ------------------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| Criar empresa e definir plano SaaS        | Sim                                                              | Não                              | Não                                        | Não                            | Não                                               | Não                                                     |
| Consultar operação privada da empresa     | Só com acesso explícito autorizado; não bypass global automático | Própria empresa                  | Própria empresa                            | Dados operacionais necessários | Própria operação e dados necessários              | Cliente: apenas os próprios dados; visitante: nenhum    |
| Editar dados e políticas do salão         | Só com vínculo apropriado                                        | Sim                              | Sim                                        | Não                            | Não                                               | Não                                                     |
| Cadastrar/editar serviços e profissionais | Só com vínculo apropriado                                        | Sim                              | Sim                                        | Não                            | Não                                               | Não                                                     |
| Cadastrar cliente e registrar chegada     | Só com vínculo apropriado                                        | Sim                              | Sim                                        | Sim                            | No fluxo presencial autorizado, com acesso mínimo | Sem entrada remota na fila                              |
| Operar reservas e atendimento             | Só com vínculo apropriado                                        | Empresa                          | Empresa                                    | Empresa                        | Próprios atendimentos                             | Próprias reservas por acesso seguro e dentro das regras |
| Alterar prioridade da fila                | Só com vínculo apropriado                                        | Sim, com motivo                  | Sim, com motivo                            | Sim, com motivo                | Não, salvo papel acumulado autorizado             | Não                                                     |
| Gerenciar membros/papéis                  | Governança da plataforma                                         | Empresa, sem autopromoção global | Somente delegação explicitamente permitida | Não                            | Não                                               | Não                                                     |
| Consultar auditoria                       | Auditoria de plataforma; acesso operacional controlado           | Própria empresa                  | Própria empresa                            | Não por padrão                 | Não por padrão                                    | Não                                                     |
| Consultar catálogo/fila agregada pública  | Sim                                                              | Sim                              | Sim                                        | Sim                            | Sim                                               | Sim, quando publicados                                  |

Regras novas de delegação do gestor precisam ser aprovadas antes de serem liberadas. O cliente público não recebe permissão sobre tabelas privadas apenas por conhecer um slug ou identificador.

## 7. Decisões de produto e cuidados com o banco

1. Manter as regras aprovadas: fila presencial; preferência específica ou qualquer disponível; uma entrada ativa; encaixe só se couber; chamada de 5 minutos; buffer inicial de 5 minutos configurável; tolerância inicial de 10 minutos configurável; cancelamento/remarcação do cliente até 2 horas antes, protegido por acesso seguro.
2. Atraso de reserva não autoriza cancelamento automático. Pausar profissional não transfere/cancela reservas sem ação autorizada.
3. O banco já prepara constraints, índices, RLS e snapshots; isso reduz trabalho de fundação, mas não implementa sozinho a máquina de estados nem o cálculo de disponibilidade.
4. Criar operações específicas para clientes, agenda, fila e mudanças de disponibilidade. Compatibilizar essas operações para proteger simultaneamente reserva, fila e bloqueios do mesmo profissional.
5. Planejar mudanças de esquema pelo fluxo administrado do projeto Lovable, preservando dados e auditando migrações. Este plano não executou SQL nem alterou o banco.
6. Atualizar documentos históricos com referência à versão vigente, sem tratar o antigo cronograma de sete dias como prova de entrega ou compromisso de prazo atual.

## 8. Checklist do primeiro pacote de entrega

- [ ] Papéis do vínculo disponíveis à interface e testados no servidor.
- [ ] Menu e tela de clientes com busca/cadastro/edição.
- [ ] Operação segura de clientes implementada e autorizada.
- [ ] Serviço: criar, editar, inativar e vincular profissional.
- [ ] Profissional: criar, editar/inativar e vincular serviços.
- [ ] Configurações e dados do estabelecimento editáveis conforme papel/coluna.
- [ ] Chamada de 5 minutos e slug sem edição indevida.
- [ ] Persistência confirmada após recarregar cada tela.
- [ ] Estados de salvando, erro e sucesso reais; proteção contra duplo envio.
- [ ] Dados históricos preservados ao alterar cadastros.
- [ ] Proprietário, gestor, recepção e profissional testados.
- [ ] Empresa A não lê nem altera registros da empresa B.
- [ ] Versão publicada e configuração Supabase conferidas.

## 9. Evidências de código para retomada

| Constatação                                                     | Arquivo / referência                                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Cadastro de serviços desativado                                 | `src/routes/app.servicos.tsx`, botão com `disabled`                                           |
| Cadastro de profissionais desativado                            | `src/routes/app.profissionais.tsx`, botão com `disabled`                                      |
| Configurações somente leitura                                   | `src/routes/app.configuracoes.tsx`, elementos `dl/dt/dd`, sem formulário/mutação              |
| Ausência de módulo de clientes                                  | `src/components/layout/nav.ts` e inventário de `src/routes/`                                  |
| Leitura interna de clientes                                     | `src/components/layout/OrganizationProvider.tsx`, seleção `id,display_name`                   |
| Papéis ainda não expostos no contexto                           | `OrganizationProvider.tsx`, seleção de vínculos apenas por `organization_id`                  |
| Atualização por consulta periódica                              | `OrganizationProvider.tsx`, `refetchInterval: 30_000`                                         |
| Novo agendamento desativado                                     | `src/routes/app.agenda.tsx`                                                                   |
| Operação de fila desativada                                     | `src/routes/app.fila.tsx`                                                                     |
| Nova empresa exige gestor existente                             | `src/routes/admin.empresas.tsx` e função `gs_create_organization` dos SQLs entregues          |
| Segurança da interface e da recuperação testadas com simulações | `src/test/auth-access.test.tsx`, `organization-access.test.tsx`, `password-recovery.test.tsx` |

## 10. Comparação com as 30 áreas da pesquisa

Os nomes e a numeração abaixo foram recuperados da pesquisa. “Falta” descreve a comparação com o código inspecionado. Os agrupamentos de implantação e os critérios técnicos são recomendações desta auditoria. O levantamento por módulo não equivale a uma contagem de todos os subitens originais.

| Pesquisa | Área                         | O que já temos                                                                     | O que falta / destino no plano                                                                                                                   |
| -------- | ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01       | Empresas/unidades            | Organização, slug, plano e vínculo; admin cria com usuário existente               | Editar/configurar operação (fase 1), administrar acessos (5), estrutura de filiais/grupo (6E)                                                    |
| 02       | Serviços                     | Leitura de nome, duração e preço                                                   | Cadastro, edição, inativação e habilitação por profissional (1)                                                                                  |
| 03       | Profissionais                | Leitura de equipe/disponibilidade                                                  | Cadastro, serviços habilitados (1), horários/bloqueios (2), acesso e permissões (0/5)                                                            |
| 04       | Agenda                       | Agenda de hoje somente leitura; esquema de reservas                                | Visões/filtros, disponibilidade, reservar/remarcar/cancelar e estados (2)                                                                        |
| 05       | Agendamento online           | Catálogo público e indicação da configuração; sem reserva real                     | Disponibilidade e confirmação transacional, proteção antiabuso e gestão da própria reserva (4)                                                   |
| 06       | Fila                         | Listagem de entradas ativas; estrutura preparada                                   | Entrada presencial, elegibilidade, chamada, ausência, conclusão e reentrada (3)                                                                  |
| 07       | Lista de espera por vaga     | Nada específico                                                                    | Preferências, disponibilidade desejada, aviso, prazo e reserva temporária; processo distinto da fila (6D)                                        |
| 08       | Clientes                     | Tabela e leitura interna de nomes                                                  | Módulo de lista/busca/cadastro/edição e histórico (1); CRM ampliado depois (6D)                                                                  |
| 09       | Check-in/atendimento/comanda | Estados/timestamps previstos no banco e botões desativados                         | Operar atendimento (2/3); comanda por itens, adicionais e profissional, troca/reabertura autorizadas (6A)                                        |
| 10       | Caixa                        | Ausente                                                                            | Abrir/fechar por operador/turno, sangria/suprimento, pagamentos, troco, diferenças e conciliação (6A)                                            |
| 11       | Financeiro                   | Ausente                                                                            | Contas a pagar/receber, bancos, transferências, receitas/despesas, recorrências, resultado e fluxo previsto/realizado (6B)                       |
| 12       | Comissões                    | Ausente                                                                            | Regras por profissional/serviço/produto, base bruto/líquido, taxas/descontos, divisão, estorno, apuração, aprovação e extrato (6B)               |
| 13       | Pacotes/assinaturas/clube    | Nenhum clube de cortes; plano cadastral do SaaS é outra coisa                      | Créditos/consumo/validade/benefícios, limites, dependentes, recorrência, renovação, pausa e cancelamento (6C)                                    |
| 14       | Produtos/estoque             | Ausente                                                                            | Produtos/insumos, fornecedores, custos/preços, estoque, compras, lotes, consumo, perdas e inventário (6C)                                        |
| 15       | Comunicação                  | Apenas autenticação/recuperação por e-mail; sem mensagens operacionais             | Confirmações/lembretes, fila/vagas, cancelamento, pós-visita e cobranças; estados de entrega e falhas (6D)                                       |
| 16       | CRM/marketing                | Sem módulo; identificação de cliente não constitui CRM completo                    | Histórico ampliado, segmentação, retorno/fidelidade e campanhas conforme política de comunicação (6D)                                            |
| 17       | Avaliações                   | Ausente                                                                            | Avaliação por atendimento/profissional, satisfação, reclamação/tratativa e visibilidade de conteúdo sensível (6D)                                |
| 18       | Equipe/rotinas               | Cadastro técnico de profissional/vínculo e leitura de disponibilidade              | Gestão funcional da equipe (1/5); rotinas, metas e acompanhamento ampliado (6E)                                                                  |
| 19       | Painéis/relatórios           | Indicadores básicos de hoje                                                        | Períodos/filtros, produtividade/faltas/espera, financeiro/comissões/estoque e exportações autorizadas (6B em diante)                             |
| 20       | Área do cliente              | Catálogo público; showroom fictício de aplicativo                                  | Área autenticada ou acesso próprio seguro para reservas (4); histórico, pacotes, comprovantes e avaliações (6E)                                  |
| 21       | Área profissional            | RLS prevista para operações próprias; painel geral de consulta                     | Operar a própria agenda/fila (2/3), bloqueios autorizados; metas/comissões/contestações e avaliações permitidas (6E)                             |
| 22       | Automações/IA                | Ausente                                                                            | Gatilhos, regras, limites e execução pelas mesmas operações autorizadas (6F)                                                                     |
| 23       | Integrações                  | Supabase Auth/Data API                                                             | Integrações comerciais/operacionais conforme priorização, webhooks, idempotência e rastreabilidade (6C/6E/6F)                                    |
| 24       | Administração do SaaS        | Admin separado, lista/criação de empresas e plano cadastral                        | Convites, situação/plano, limites, cobrança e suporte com controle de acesso (5/6C/6E)                                                           |
| 25       | Perfis de acesso             | Base owner, manager, receptionist, professional, admin global e cliente vinculado  | Gestão de papéis (0/5); perfis especializados de caixa, financeiro, marketing, estoque e contador à medida que existirem módulos (6)             |
| 26       | Modelo de permissões         | RLS por empresa/papel e restrições de algumas colunas nos SQLs                     | Unificar capacidade por ação/recurso/alcance/condição; campo, limite e prazo quando necessário (0 e evolução por módulo)                         |
| 27       | Permissões por área          | Políticas básicas sobre tabelas de operação                                        | Matriz de ações por módulo e testes de autorização negativa; financeiro/comissões/estoque ainda não têm modelo operacional (0/5/6)               |
| 28       | Aprovações sensíveis         | Justificativa de prioridade prevista; sem fluxo de aprovação                       | Solicitação/aprovação/executor e auditoria de exceções, especialmente descontos/estornos/reabertura/ajustes (antes de cada módulo sensível em 6) |
| 29       | Segurança/auditoria          | Auth, guards, RLS/triggers previstos, cache separado e testes simulados            | Homologação real, revogação, concorrência, restauração/contingência, privacidade e visualização de auditoria (0/5 e transversal)                 |
| 30       | UX/exceções                  | Responsividade, mensagens de vazio/erro, controles de senha e formulários pontuais | Jornadas completas, recuperação de falhas, confirmação de ações críticas, acessibilidade e testes em dispositivos/reconexão (todas as fases)     |

### Decisões de escopo trazidas pela pesquisa

- O catálogo de perfis da pesquisa é mais amplo que os papéis atuais: inclui proprietário, administrador/gestor da unidade, recepcionista, caixa, profissional, financeiro, marketing, estoque, contador, cliente e admin/suporte do SaaS. Não criar permissões vazias só para mostrar esses nomes; vincular cada perfil a ações concretas e ao alcance correto.
- O modelo avançado deve representar **ação + recurso + alcance + condição**; campo, limite e prazo entram quando aplicáveis. Exemplo de projeto: recepção pode cancelar uma reserva da própria unidade dentro das regras, mas não alterar preço, exportar toda a base ou executar estorno sem autorização. Esse exemplo é uma recomendação de implementação, não transcrição literal da pesquisa.
- Operações sensíveis precisam registrar solicitação, quem aprovou e quem executou, quando houver aprovação. Ter uma tabela de auditoria não equivale a ter um fluxo de aprovação.
- A pesquisa amplia a visão de produto. O PRD 1.3 continua sendo a referência das regras já aprovadas de agenda/fila; diferenças como autoentrada por QR/terminal exigem decisão explícita antes de mudar a regra de presença.
- Não existe percentual confiável de conclusão de toda a pesquisa com base só em módulos ou tabelas. Tampouco é correto classificar uma área inteira como pronta porque há uma tela de leitura.

**Próxima implementação recomendada:** pacote da fase 1, com a verificação de permissões da fase 0. A complementação dos subitens literais da pesquisa não bloqueia corrigir as lacunas comprovadas. Esta rodada entregou auditoria e planejamento; não alterou funcionalidades da aplicação.
