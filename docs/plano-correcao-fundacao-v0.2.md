# Cadence — plano de correção e evolução visual v0.2

Data: 12/11/2026. Base revisada: e6cbebafa7956148b57afa5f10a8e40b05ab7050.
Referências: PRD MVP 1.3 (regras operacionais) e Brand Book v1.0.

## Objetivo desta versão

Alinhar a fundação visual às decisões aprovadas e permitir revisão das jornadas antes de conectar o backend.
Os controles desta versão não criam reservas, não chamam clientes, não salvam configurações e não coletam dados pessoais. Toda disponibilidade e espera mostrada é ilustrativa.

## Plano aplicado

| Prioridade     | Correção / melhoria                                                    | Critério de revisão                                                                       |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| P0 visual      | Separar fila específica, pool qualquer disponível e agendamento online | Três controles independentes, com descrições; entrada remota não oferecida                |
| P0 visual      | Representar políticas aprovadas                                        | Chamada 5 min, buffer 5 min, atraso 10 min e cancelamento 2h; aviso de não persistência   |
| P0 visual      | Remover reserva pendente do cenário                                    | Estados compatíveis com confirmação automática futura, sem implementar confirmação falsa  |
| P0 visual      | Representar preferência e atribuição na fila                           | Distinguir cliente específico, pool único e cliente já chamado                            |
| P0 visual      | Consulta pública da espera                                             | Apenas agregados; faixa aproximada e referência fixa do cenário, sem nomes de clientes    |
| P1 visual      | Prévia de agendamento                                                  | Serviço, profissionais habilitados, horários fictícios e resumo; conclusão real bloqueada |
| P1 visual      | Recepção / tablet                                                      | Aba na fila com botões grandes e ações operacionais desabilitadas                         |
| P1 visual      | Aviso de profissional em pausa                                         | Reserva afetada permanece visível sem transferência automática                            |
| P1 visual      | Marca                                                                  | Símbolo C conceitual, favicon SVG e paleta oficial convertida para OKLCH                  |
| P1 visual      | Navegação e mensagens                                                  | Link público também no celular; erros e 404 em português                                  |
| P1 organização | Cenário único                                                          | Dados de demonstração tipados, centralizados e com horário fixo identificado              |

## Melhorias exploráveis nesta entrega

- Comparar visualmente as três modalidades sem alterar a operação.
- Entender o que é tempo já aguardado e o que é estimativa restante.
- Explorar a seleção de um serviço e ver somente profissionais habilitados e não pausados no exemplo.
- Rever o resumo de duração + buffer e a política de cancelamento antes da futura confirmação.
- Revisar o atendimento no balcão pela aba “Recepção / tablet”, dentro de /app/fila.
- Encontrar rapidamente reservas que exigem ação humana quando o profissional está pausado.

## Decisões de implementação

A prévia pública de agendamento usa um diálogo na página do estabelecimento. A recepção usa uma aba da fila.
Isso permite validar as jornadas sem criar rotas adicionais nesta rodada; /tablet e a rota dedicada de agendamento continuam como evolução possível. Não há edição manual do arquivo gerado de rotas.

O logotipo é um símbolo vetorial conceitual inspirado no C descrito no Brand Book, não uma arte-final oficial extraída do PDF.

A faixa de espera é um dado fixo de demonstração. Não implementamos um algoritmo incompleto que pareça prever espera real.
Os horários da prévia não são disponibilidades calculadas. O painel interno aberto continua contendo somente dados fictícios.

## Próxima etapa: gestão e persistência

1. Conectar Supabase pelo Lovable e definir organizações, vínculos e papéis cumulativos.
2. Implementar cadastros de unidade, profissionais, serviços, habilitações e horários.
3. Persistir as três modalidades e políticas com validação no servidor, permissões e auditoria.
4. Proteger rotas internas e comprovar isolamento entre duas organizações, inclusive pela API.
5. Separar dados operacionais das respostas públicas agregadas.

Aceite: usuário de uma unidade não consulta ou altera outra; proprietário também pode atender; configurações são recuperadas após novo login.

## Depois: agenda, fila e piloto

- Agenda: disponibilidade real, atribuição de qualquer profissional na confirmação, reserva atômica, prevenção de duplicidade, buffers sem duplicação e confirmação só após sucesso.
- Fila: chegada presencial, FIFO entre elegíveis, atribuição atômica na chamada, cinco minutos de resposta e ausência manual; prioridade exige motivo e autorização.
- Pausa: impedir novas operações conflitantes, recalcular estimativas e sinalizar reservas afetadas sem transferir automaticamente.
- Cancelamento: janela configurável, link seguro de escopo restrito, expiração, revogação e proteção contra abuso; exceções auditadas.
- Tempo real: algoritmo determinístico de espera com reservas, duração, pausas e buffers; dados sem confiança devem mostrar estimativa indisponível.
- Piloto: homologar concorrência, privacidade, RLS, reconexão, retenção, backups e operação de contingência antes de dados reais.

Academy, pagamentos, assinaturas, CRM avançado, WhatsApp e IA continuam posteriores ao MVP.

## Validação desta rodada

Resultados locais:

- Análise TypeScript do código alcançável a partir de `src/router.tsx`, com tipos de Vite e sem a pasta de testes: zero diagnósticos.
- Formatação dos 17 arquivos alterados concluída com Prettier.
- `npm run build`: bloqueado pela ausência de `enhanced-resolve` no cache local.
- `npm test`: bloqueado pela ausência de Vitest.
- `npm run lint`: bloqueado pela ausência de `brace-expansion`.
- `tsc --noEmit` completo: bloqueado pela ausência de `vitest/globals`.
- Instalação normal indisponível: DNS do registro npm inacessível. As dependências recuperadas do cache correspondem aos hashes do lockfile, sem troca de versões.
- Inspeção visual desta nova versão ainda pendente; a aplicação publicada continua na versão anterior.

O PR permanece em rascunho até build, testes, lint e homologação visual em um ambiente completo. Esta entrega não comprova backend, segurança multiempresa, sincronização ou prontidão para piloto real.

Checklist visual de homologação:

- [ ] Desktop: painel, agenda, fila, recepção, configurações e página pública.
- [ ] Celular: navegação, diálogo de agendamento, seleção por teclado e ausência de corte horizontal.
- [ ] Nenhuma tela sugere que uma reserva ou alteração real foi salva.
- [ ] Página pública não mostra nomes de clientes, posições pessoais ou telefones da fila.
- [ ] Valores iniciais refletem as políticas aprovadas.
