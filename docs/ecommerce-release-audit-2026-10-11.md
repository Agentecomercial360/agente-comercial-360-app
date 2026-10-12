# AC360 — Auditoria de diferença de release (11/10/2026)

## Evidências observadas
- Vercel produção: commit `74efb5d789efb546b0337cf727708e641f029405`, READY.
- GitHub `main`: commit `21b1423d20bda7c3f9d5fd66bec0c69e832541c3`, **15 commits à frente** da versão publicada.
- PR #27: correção do popup OAuth + teste de regressão e CI; preview do commit `ae56f8f` READY; GitHub Actions build + regressão aprovados.
- A publicação integral da `main` pode levar **mais alterações do que apenas a correção do OAuth**.

## Classificação das mudanças ainda fora de produção
| Área | Arquivos relevantes | Risco / teste de saída |
|---|---|---|
| Cadastro e login | `ecommerce/login.tsx`, `onboarding.tsx`, recuperação/redefinição de senha | Alto: confirmação de e-mail, sessão, redirecionamentos, RPC de criação |
| OAuth e primeira sincronização | `ml-oauth.ts`, `ml-sync.ts`, `contas.tsx`, `AccountsSyncStatus.tsx` | Alto: state, callback, token, tenant, retomada após falha |
| Gestão de empresa / cobrança manual | `admin/empresas.tsx`, `admin/planos.tsx`, SQL administrativo | Alto: somente admin, módulos e permissões, nenhum dado fictício exibido como cobrança |
| Escopo multiempresa | `ecommerce-active-account.tsx`, `EcommerceLayout.tsx`, consultas das páginas | Alto: alternância de contas, sessão cruzada, RLS e dados filtrados |
| Métricas e operação | dashboard, Ads, custos/margem, produtos, estoque, expedição, IA | Médio/alto: valores reais, não confundir lucro estimado e confirmado |
| CI e documentação | workflow Frontend Build, checklist, SQL versionado | Baixo para UI; atenção à correspondência entre SQL versionado e banco efetivo |

## Gate de homologação antes do release
- [x] Build de PR #27 com regressão OAuth aprovado no GitHub Actions.
- [x] Preview de PR #27 com status READY.
- [x] RLS em contas/pedidos/integrações verificado; views críticas usam `security_invoker`.
- [ ] Login de novo usuário com confirmação de e-mail e criação da empresa.
- [ ] OAuth real em Chrome desktop e Safari iOS; cancelamento; callback atrasado; token vencido.
- [ ] Primeiro sync (30 dias), recuperação após interrupção e refresh de token.
- [ ] Duas empresas não administradoras com contas diferentes, teste de leitura e tentativa de escrita cruzada via API.
- [ ] Administração de clientes e planos: permissões e estados reais.
- [ ] Integridade de métricas financeiras após deploy; resultados estimados identificados.
- [ ] Configuração Auth do Supabase: proteção de senha comprometida e URLs permitidas.
- [ ] Smoke test de produção e rollback documentado antes de publicar o lote acumulado.

## Recomendação
Não liberar automaticamente 15 commits sem revisão da release completa. Fazer homologação em preview no SHA exato proposto para produção. Manter PR #27 em draft até testes OAuth reais. Se for necessária uma correção emergencial apenas do popup, avaliar um cherry-pick controlado sobre o SHA já publicado, em branch de hotfix separada, com testes próprios — não trocar a `main` por esse SHA sem plano de reconciliação.
