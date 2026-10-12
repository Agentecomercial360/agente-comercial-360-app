# AC360 — Roteiro de homologação Mercado Livre sem loja real

## Pré-condições
- Responsável pela aplicação com acesso legítimo ao painel Mercado Livre Developers; não compartilhar senha, client secret, access token ou refresh token.
- Preferir usuários de teste oficiais do Mercado Livre quando suportados pelo fluxo OAuth atual. Confirmar requisitos/limitações na documentação do Mercado Livre antes de gerar contas.
- Utilizar **preview** do PR #27 (não produção) para a primeira homologação.
- Antes de iniciar, verificar que o callback cadastrado na aplicação coincide com `MERCADOLIVRE_REDIRECT_URI` do Railway, por meio de conferência por pessoa autorizada; não registrar valores secretos em commits.

## Roteiro de teste (evidências sem dados confidenciais)
| ID | Ação | Esperado | Resultado |
|---|---|---|---|
| T01 | Acessar `/ecommerce/login` sem sessão | Tela de login, sem dashboard privado | Pendente |
| T02 | Criar usuário AC360 com e-mail de teste e confirmar e-mail | Sessão e onboarding disponíveis | Pendente |
| T03 | Criar empresa A e uma conta ML | Criar somente no tenant A; `not_connected` | Pendente |
| T04 | Clicar no botão de conectar Mercado Livre | Popup iniciado pelo clique; URL assinada pelo backend | Pendente |
| T05 | Fechar popup sem conceder autorização | Mensagem compreensível após tolerância; conta continua desconectada | Pendente |
| T06 | Autorizar com usuário ML de teste permitido | Callback assinado, integração conectada e token válido | Pendente |
| T07 | Finalizar OAuth fechando o popup imediatamente | Estado conectado deve prevalecer sobre aviso de cancelamento | Pendente |
| T08 | Importar os primeiros 30 dias | Mensagem com contagem real, `last_sync_at` da mesma conta e ausência de registros fabricados | Pendente |
| T09 | Interromper e retomar onboarding | Etapa reconstruída do banco; não criar conta duplicada | Pendente |
| T10 | Repetir fluxo no Safari iOS e Chrome desktop | Sem bloqueio de popup em clique direto, mensagens de erro úteis | Pendente |
| T11 | Criar empresa B/usuário B independente | B não lê/escreve empresa A em pedidos, contas, produtos ou integração | Pendente |
| T12 | Testar sessão vencida/sem JWT em auth-url e sync | 401; acesso cruzado 403 ou resposta equivalente sem dados alheios | Pendente |
| T13 | Conferir painel de métricas após sync | Dados reais/simulados claramente distintos; sem afirmar lucro exato sem custo | Pendente |
| T14 | Confirmar variáveis, logs sanitizados e eventual rollback | Sem tokens em logs e plano de retorno à versão anterior | Pendente |

## Evidências a coletar
- Para cada caso, registrar navegador/versão, horário, passos e resultado (PASS/FAIL/BLOCKED).
- Capturas sem CPF, e-mail pessoal, credenciais, tokens, códigos OAuth ou dados de compradores.
- Quando um teste falhar, registrar somente mensagem sanitizada, código HTTP e ID de correlação disponível.

## Regra de go/no-go
Não marcar OAuth/sync como homologado por CI, status READY de preview, ou HTTP 200 genérico do Railway. É necessário pelo menos T01–T12 com evidência e validação da diferença de release entre `main` e Vercel produção. Cobrança automatizada continua indisponível sem webhook autenticado e controle server-side de assinatura.
