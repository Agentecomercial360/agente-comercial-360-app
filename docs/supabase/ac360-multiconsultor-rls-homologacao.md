# Homologação real de RLS — AC360 multi-consultor

**Estado:** cenário preparado, NÃO executado; aplicar somente em banco isolado, nunca no banco de produção.

## Pré-requisitos
1. Criar branch/projeto Supabase de homologação com custos explicitamente aprovados.
2. Aplicar a versão revisada de `docs/supabase/ac360-multiconsultor-v1.sql` na branch.
3. Criar 3 usuários de teste no Auth: admin, consultor A e consultor B. Criar duas empresas de teste (A e B), sem dados reais.
4. Confirmar que a função `is_platform_admin()` reconhece apenas o admin de teste.
5. Cadastrar dois consultores e atribuir A→empresa A, B→empresa B, usando `company_display_name`.

## Cenários obrigatórios (executar como usuário autenticado, não como service_role)
- **T01:** A lê sua própria atribuição → 1 linha.
- **T02:** A lê atribuição de B → 0 linhas.
- **T03:** A insere reunião na própria atribuição → permitido.
- **T04:** A tenta inserir reunião na atribuição de B → erro RLS.
- **T05:** A lê plano e tarefas de B → 0 linhas.
- **T06:** A tenta alterar tarefa do plano B → 0 linhas afetadas/erro.
- **T07:** B repete T01–T06 com os papéis invertidos.
- **T08:** A tenta criar consultor ou reatribuir cliente → negado.
- **T09:** Admin cadastra consultor, atribuição e reúne dados das duas empresas → permitido.
- **T10:** Inativar consultor A → nenhuma atribuição, sessão, plano ou tarefa deve estar disponível a A.
- **T11:** Desativar vínculo de A com empresa A → acesso a sessões/planos/tarefas bloqueado.
- **T12:** Usuário anônimo lê as cinco tabelas → negado.
- **T13:** A visualiza nome de empresa A no campo `company_display_name` sem leitura à tabela `companies` → permitido.
- **T14:** Testar troca de `assignment_id` em sessões/planos e `plan_id` em tarefas através de UPDATE; não deve ser possível mudar para IDs de outra carteira.
- **T15:** Verificar comportamento de duas atribuições ativas do mesmo cliente com cargo `lead` → constraint deve impedir.
- **T16:** Verificar políticas de UPDATE e SELECT em toda a árvore de relacionamento.
- **T17:** Verificar se uma empresa do AC360 E-commerce está sendo referenciada por `public.companies` correta, sem confundir com tenant de outro módulo.
- **T18:** Validar arquivamento/revinculação: a antiga atribuição não pode continuar autorizando o ex-consultor.

## Pass/fail
Registrar usuário autenticado, operação, tabela, UUID sintético da carteira, resultado esperado e observado. Só liberar merge se todos os testes passarem e o backend/frontend puderem ler o tenant correto.

## Limitações
Os contratos em `tests/consulting` conferem padrões de código, **não** são prova de execução real de políticas PostgreSQL. Não usar tokens reais de vendedores, usuários reais ou `service_role` para simular acesso de consultores.
