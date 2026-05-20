## Objetivo

Substituir o bloco "AC" desenhado em CSS na sidebar pela logo oficial `src/assets/ac-logo.png`, mantendo proporção e legibilidade sobre o fundo azul-marinho. Sem alterar cores, layout, rotas ou tipografia.

## Escopo

Apenas um arquivo afetado:

- `src/components/dashboard/DashboardLayout.tsx`

A tela de login (`src/routes/login.tsx`) já usa a logo oficial — não será tocada.

## Mudanças

1. Importar a logo no topo do arquivo:
   ```ts
   import acLogo from "@/assets/ac-logo.png";
   ```

2. No header da sidebar (linhas 43–51), remover o `<div>AC</div>` e o texto "Agente Comercial / 360". Renderizar apenas a logo oficial centralizada, com altura controlada para caber bem no header (~44–56px), `object-contain` para preservar proporção, e `alt="Agente Comercial 360"`.

   Como a logo já contém o texto "AGENTE COMERCIAL 360", não duplicaremos o nome ao lado — fica mais limpo e fiel à marca.

3. Como o fundo da sidebar é azul-marinho escuro e a logo tem o "AC" também em azul-marinho, envolver a imagem em um container com fundo branco levemente arredondado (`bg-white rounded-xl p-2`) para garantir contraste e leitura premium, OU usar uma versão clara. Recomendação: container branco com padding suave — mantém a logo intacta sem editá-la.

4. Nenhuma outra alteração: nav items, topbar, rotas, cores e tokens permanecem iguais.

## Riscos

- Nenhum risco para `/login` ou rotas.
- Sem mudanças em `routeTree.gen.ts`, `styles.css` ou tokens.
- A logo já existe em `src/assets/ac-logo.png` (criada anteriormente), então o import resolve sem quebra de build.

## Validação

Após a mudança: abrir `/dashboard` e verificar que a logo aparece limpa no topo da sidebar, com proporção correta e bom contraste sobre o fundo navy.
