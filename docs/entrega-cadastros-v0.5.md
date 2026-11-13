# Entrega v0.5 — Cadastros e configurações

Data: 13/11/2026. Implementa o primeiro pacote da [auditoria v0.4](auditoria-e-plano-implementacao-v0.4.md).

## Implementado no código

- Clientes: menu/rota, busca paginada por nome ou telefone, cadastro, edição e histórico recente de agenda/fila por empresa.
- Telefone brasileiro com DDD normalizado em E.164; outros países aceitos com prefixo +. Possíveis telefones compartilhados exigem confirmação na interface, sem criar uma restrição de unicidade indevida.
- Serviços: criar/editar, preço em centavos, duração, ativo/inativo e profissionais habilitados.
- Profissionais: criar/editar/inativar e vincular serviços. O registro de profissional não cria nem modifica login de usuário.
- Configurações: dados comerciais e políticas em formulários separados, com confirmação independente de cada gravação. Slug e janela de chamada de 5 minutos não são editáveis.
- Perfis da empresa no contexto: proprietário/gestor gerenciam catálogo/configurações; recepção também gerencia clientes. O administrador global não ganha acesso operacional sem vínculo apropriado.
- SQL complementar com três RPCs de gravação, verificação de empresa/papel, validação no servidor, comparação de versão, reenvio idempotente com ID fixo e vínculos transacionais.
- Edição de habilitações pelos dois lados invalida a versão do cadastro relacionado; uma edição aberta anteriormente é rejeitada para atualização. Inativação preserva o histórico e as referências.
- Formulários abertos são desmontados ao trocar de empresa; cada gravação envia a empresa capturada ao abrir a tela. Alterações de sessão limpam o cache privado, conforme implementação anterior.

## Ativação necessária no projeto hospedado

A conexão Supabase disponível não possui permissão administrativa no projeto `hqluhoibwemluotgryur`; a consulta de identificação foi recusada. Por isso não foi possível aplicar SQL nem homologar usuários reais nesse projeto durante a entrega.

1. No fluxo de banco administrado do projeto, revisar e aplicar [06_cadastros.sql](sql/06_cadastros.sql) após os SQLs 1 e 2 já instalados. Não repetir os SQLs de fundação em uma instalação existente.
2. Executar [07_verificar_cadastros.sql](sql/07_verificar_cadastros.sql). As três funções devem retornar OK, assim como a verificação de ausência de escrita direta/acesso público em clientes. Os wrappers públicos são invoker e as funções privadas definer com search_path vazio e autorização explícita.
3. Publicar a versão atualizada no Lovable.
4. Entrar como gestor da empresa e testar cadastro, edição, inativação, recarga e perfil de recepção. Repetir com uma segunda empresa para homologar o isolamento na instalação real.

A edição das configurações usa os grants já previstos nos SQLs anteriores. Os cadastros por RPC precisam do SQL 6; sem ele, a interface apresenta erro de ativação e não finge que gravou.

## Validação executada

- Build de cliente/servidor concluído.
- TypeScript sem diagnósticos na verificação.
- 24 testes automatizados da aplicação passaram: autenticação, recuperação, troca de empresa e os novos formulários, incluindo erros, colunas permitidas, confirmação de telefone compartilhado, preço, telefone, versão e duplo envio.
- 41 verificações no PostgreSQL local por PGlite passaram, usando os SQLs de fundação e o complemento. Incluem aplicação repetida do SQL, permissões, duas empresas, recepção/profissional/gestor, suspensão, validação, idempotência, conflito de versão, vínculos cruzados, preservação e auditoria.
- Lint sem erros; avisos de Fast Refresh em módulos que compartilham componentes/hooks.

Essas verificações não equivalem a uma homologação autenticada na produção. Não foram criados clientes, profissionais nem usuários reais nessa instalação hospedada.

## Próximos trabalhos

Horários de trabalho, bloqueios, criação/remarcação de reservas, operação da fila e convites de acesso continuam nas próximas fases do plano. A janela de chamada, a ausência manual e a regra de presença do MVP não foram alteradas.
