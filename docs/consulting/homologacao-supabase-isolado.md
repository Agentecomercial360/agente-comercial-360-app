# AC360 Multi-consultor — homologação isolada

**Situação:** roteiro preparado, homologação real ainda não executada. Não usar o Supabase de produção `dmwcbecihuxqzzjouevk`.

## Pré-requisitos bloqueantes

1. Usar **um projeto Supabase dedicado e isolado**, autorizado e com custo previamente aprovado se houver cobrança. Não reutilizar projetos existentes de finalidade desconhecida.
2. Aplicar somente nesse projeto o esquema necessário do AC360 (incluindo `auth.users`, `companies`, `ecommerce_accounts`, `platform_admins`, `is_platform_admin()`) e a migração candidata `docs/supabase/ac360-multiconsultor-v1.sql`. Rever dependências antes de aplicar. **Jamais aplicar o SQL ao projeto produtivo como parte deste roteiro.**
3. Criar três contas de teste distintas no **Supabase Auth isolado**: um administrador (presente na estrutura `platform_admins`) e dois consultores ativos registrados em `ac360_consultants`. Todos os e-mails/senhas devem ser exclusivos de teste.
4. Criar duas empresas fictícias com contas e-commerce fictícias, uma atribuída a cada consultor, e pelo menos uma reunião e um plano de ação para cada atribuição. Não importar dados reais de clientes.
5. Preparar GitHub Actions Secrets com os nomes abaixo, somente para o ambiente de teste. **Não inserir segredos em commits, logs, PRs ou documentos.**

## GitHub Actions Secrets obrigatórios

| Secret | Valor esperado |
|---|---|
| `AC360_RLS_TEST_URL` | URL HTTPS do projeto isolado (`https://<ref>.supabase.co`) |
| `AC360_RLS_TEST_PROJECT_REF` | Referência do projeto isolado; nunca a de produção |
| `AC360_RLS_TEST_ANON_KEY` | Chave pública de teste, jamais `service_role` |
| `AC360_RLS_TEST_ISOLATED` | `YES` |
| `AC360_RLS_TEST_ADMIN_EMAIL`, `AC360_RLS_TEST_ADMIN_PASSWORD` | Login de administrador fictício |
| `AC360_RLS_TEST_A_EMAIL`, `AC360_RLS_TEST_A_PASSWORD` | Login do consultor fictício A |
| `AC360_RLS_TEST_B_EMAIL`, `AC360_RLS_TEST_B_PASSWORD` | Login do consultor fictício B |
| `AC360_RLS_TEST_A_ASSIGNMENT_ID` | UUID de atribuição fictícia A |
| `AC360_RLS_TEST_B_ASSIGNMENT_ID` | UUID de atribuição fictícia B |

## Execução e critérios

- Conferir primeiro que o workflow `.github/workflows/ac360-consulting-homologation.yml` está **registrado na branch padrão**. Se ele existir apenas numa feature branch, a opção de execução manual pode não aparecer. Não mesclar o PR inteiro na produção só para habilitar o workflow.
- Executar manualmente **AC360 Consulting Supabase Homologation** na revisão pretendida, após garantir que os secrets apontem somente para projeto isolado.
- A rotina `tests/consulting/rlsIsolationSmoke.mjs` bloqueia a referência de produção, verifica os três logins reais, o diretório administrativo, os dois vínculos, as leituras cruzadas, tentativas de inserção indevida, alterações estrangeiras e acesso anônimo.
- Falha de qualquer teste: **não publicar**. Corrigir a causa e reexecutar.
- Depois da rotina automatizada, homologar no navegador as rotas `/admin/consultores`, `/admin/acompanhamento`, `/consultoria/carteira` com cada identidade: cadastro de consultor, atribuição, criação/conclusão de reunião, plano, tarefa, transferência e perda de acesso.
- Conferir também políticas RLS, caminhos de erro, responsividade e logout. A aprovação do smoke **não substitui** o teste do frontend.

## Estado atual

Os builds do PR e os testes PostgreSQL efêmeros passaram até o GitHub Actions #132. **Nenhuma homologação com Supabase Auth/Data API reais ou navegador foi concluída.** O PR #28 permanece draft; não foi feito merge, deploy ou alteração no banco produtivo.
