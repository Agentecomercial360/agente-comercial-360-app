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

## Smoke test de leitura e tentativas de escrita cruzada (executável, apenas homologação)
Após migrar **somente um projeto separado** e criar as atribuições de teste, rode a partir da raiz do repositório:

```bash
AC360_RLS_TEST_ISOLATED=YES \
AC360_RLS_TEST_URL=https://SEU-PROJETO-DE-TESTE.supabase.co \
AC360_RLS_TEST_ANON_KEY=chave_publica_de_teste \
AC360_RLS_TEST_A_EMAIL=consultor-a@example.test \
AC360_RLS_TEST_A_PASSWORD=senha-de-teste \
AC360_RLS_TEST_B_EMAIL=consultor-b@example.test \
AC360_RLS_TEST_B_PASSWORD=senha-de-teste \
AC360_RLS_TEST_A_ASSIGNMENT_ID=uuid-atribuicao-a \
AC360_RLS_TEST_B_ASSIGNMENT_ID=uuid-atribuicao-b \
AC360_RLS_TEST_ADMIN_EMAIL=admin@example.test \
AC360_RLS_TEST_ADMIN_PASSWORD=senha-admin-teste \
node tests/consulting/rlsIsolationSmoke.mjs
```

O script se recusa a usar o hostname do projeto de produção e exige a confirmação `AC360_RLS_TEST_ISOLATED=YES`. Ele autentica ambos os consultores, testa leitura própria, bloqueio de leitura cruzada de vínculos/reuniões/planos e leitura anônima das cinco tabelas. O script também tenta alterar o nome de exibição de um vínculo de outro consultor e inserir reuniões e planos na carteira de outro consultor e exige bloqueio por RLS. Em caso de falha de segurança, a inserção pode criar registros no projeto de teste. O teste falha imediatamente e esses registros sintéticos devem ser limpos manualmente no ambiente isolado. A verificação usa a resposta do INSERT, sem depender da política de SELECT para detectar inserções indevidas. **Não execute em produção.** Ele ainda não substitui testes de UPDATE em planos/tarefas, reatribuição, inativação e integridade.

A conta `AC360_RLS_TEST_ADMIN_EMAIL` deve ser **administradora somente do ambiente isolado**, com acesso para ler atribuições de teste. O teste de `UPDATE` compara valores antes/depois por esse acesso independente, eliminando falso positivo causado por SELECT/RLS do consultor. Não use contas ou senhas de produção.
