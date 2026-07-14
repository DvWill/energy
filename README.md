# Energy — Landing page

Landing page institucional em Next.js, TypeScript e Tailwind CSS. O conteúdo comercial não fornecido permanece explicitamente pendente; revise `src/content/landing-page.ts` antes de publicar.

## Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Validação completa: `npm run lint`, `npm run typecheck`, `npm run test:e2e` e `npm run build`.

## Conteúdo e identidade

Edite títulos, CTAs, benefícios, FAQ e contatos em `src/content/landing-page.ts`. Copie os assets oficiais, sem alterar proporções, para:

- `public/brand/energy-logo-horizontal-white-orange.png`
- `public/brand/energy-symbol-black.png`
- `public/brand/energy-symbol-orange.png` (também deve originar o favicon)

Os três arquivos oficiais estão organizados nesses caminhos e são utilizados no header, footer e favicon.

## Animações

A camada de movimento usa apenas `motion`. Curvas, durações, variantes e configuração de viewport ficam centralizadas em `src/lib/motion.ts`; as ilhas Client reutilizáveis ficam em `src/components/motion/`. O site respeita `prefers-reduced-motion` e mantém conteúdo, FAQ e navegação mobile acessíveis sem JavaScript.

## Temas

O seletor no header alterna entre os modos claro e escuro. Na primeira visita, o site acompanha `prefers-color-scheme`; depois, a escolha é preservada no navegador pela chave `energy-theme`. O tema é aplicado antes da hidratação para evitar mudança visual durante o carregamento.

## Integração de leads

Copie `.env.example` para `.env.local`. Defina `NEXT_PUBLIC_SITE_URL` com o domínio canônico e `LEAD_WEBHOOK_URL` com um endpoint HTTPS de CRM, automação ou e-mail. O servidor envia JSON normalizado com `name`, `company`, `email`, `phone`, `message`, `source` e `submittedAt`. Sem webhook, a API responde 503 e a interface informa honestamente que o canal não está configurado.

Antes da publicação, configure proteção de borda/rate limit na hospedagem, revise a política com apoio jurídico e forneça os dados oficiais listados em `siteContent.pending`.

No GitHub Pages não existe servidor para `/api/leads`. Para habilitar o formulário nessa hospedagem, configure `NEXT_PUBLIC_LEAD_FORM_URL` com um endpoint externo compatível (por exemplo, seu CRM ou serviço de formulários). Sem essa variável, a página informa que o canal ainda não está conectado e não exibe sucesso falso.

## GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente a branch `main`. No GitHub, acesse **Settings → Pages → Build and deployment** e selecione **GitHub Actions** como fonte. O endereço será `https://dvwill.github.io/energy/`.

## Publicação

Execute `npm run build` e publique em uma plataforma compatível com Next.js (Node.js). Configure as variáveis de ambiente no provedor e valide domínio, webhook, favicon, consentimento e documentos legais no ambiente final.

## Blog e painel editorial

O blog público está disponível em `/blog` e o painel protegido em `/admin/blog`. O módulo usa Drizzle ORM com Neon PostgreSQL. A migration inicial está em `drizzle/0000_blog.sql`; para desenvolvimento, revise o diff e aplique o schema com `npm run db:push`.

Configure no ambiente do servidor:

- `DATABASE_URL`: conexão Neon com `sslmode=require`;
- `AUTH_SECRET`: segredo aleatório com pelo menos 32 caracteres;
- `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH`: acesso administrativo, usando hash bcrypt;
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`: upload de capas e imagens editoriais;
- `NEXT_PUBLIC_SITE_URL`: URL canônica pública.

Gere um hash de senha com `node -e "require('bcryptjs').hash(process.argv[1],12).then(console.log)" "SUA-SENHA"`. Nunca armazene a senha em texto puro ou envie variáveis privadas ao cliente.

O blog depende de rotas dinâmicas, banco e sessões HTTP-only, portanto deve ser publicado em um runtime Next.js/Node (por exemplo, Vercel). A exportação estática para GitHub Pages continua adequada somente à landing; ela não suporta o blog, painel ou APIs.
