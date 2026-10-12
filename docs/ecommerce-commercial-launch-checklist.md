# AC360 E-commerce — Critérios de liberação comercial

Estado: preparação de lançamento. Este documento é um checklist de validação, **não** um certificado de que os testes passaram.

## Evidências confirmadas no código

- Cadastro de acesso e onboarding self-service: PR #13 (merge).
- Recuperação de senha: PR #14 (merge).
- Validação de token Mercado Livre na tela de onboarding: PR #15 (merge).
- Guarda de acesso e correções multiempresa: PR #16 (merge).
- Central administrativa de clientes: PR #17 (merge).
- Autorização Mercado Livre iniciada por clique explícito: PR #18 (merge).
- Remoção de faturamento/assinaturas fictícios: PR #19 (merge).

## Impedimentos para abrir venda self-service sem acompanhamento

- [ ] Confirmar URL e deployment de **produção** Vercel após o merge em main. Preview verde não comprova promoção a produção. Resolver limite de builds se persistir.
- [ ] Identificar o projeto Railway que de fato hospeda `ac360-mercadolivre-api-production.up.railway.app`; o projeto Railway “Agente Comercial 360 - Backend” acessível nesta revisão lista n8n e postgres, não a API ML.
- [ ] Confirmar no Supabase de produção todas as migrações/RPCs e views exigidas pelo onboarding, especialmente `create_ecommerce_onboarding_company_v1`, `vw_user_access_context`, `vw_ecommerce_integration_status`.
- [ ] Executar cadastro **real** com email de teste, confirmar email, criar empresa e conectar uma conta ML de teste autorizada pelo titular, em Safari iOS e Chrome desktop.
- [ ] Testar isolamento com dois usuários/empresas independentes: consultas de pedidos, produtos, contas e integrações; inserção e alteração com `company_id` de outra empresa devem ser negadas pelo banco/API.
- [ ] Testar endpoints backend de OAuth e sync com JWT válido, expirado e usuário de outra empresa; garantir HTTP 401/403 apropriados.
- [ ] Confirmar primeira importação de 30 dias e retomada do onboarding após interrupção; validar sincronizações agendadas, refresh do token e alertas.
- [ ] Definir provedor de cobrança; criar vínculo server-side entre assinatura e `company_id`, webhook autenticado, idempotência, conciliação, cancelamento, grace period e reativação.
- [ ] Bloquear liberação automática de acesso pago até existir confirmação confiável da assinatura ou aprovação administrativa registrada.
- [ ] Validar política de privacidade, termos comerciais, atendimento de suporte, cancelamento e backups/restauração.

## Regra de publicação

Nenhuma métrica demonstrativa deve aparecer como receita real.
Não criar cobranças, clientes, tokens ou dados reais durante testes sem autorização específica.
O MVP pode ser vendido de forma assistida somente após os testes críticos (tenant, OAuth, sync, segurança e produção) e com contrato/forma de pagamento definidos. Não anunciar billing automático antes de implementar e validar webhooks e bloqueios no servidor.
