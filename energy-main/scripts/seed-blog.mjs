import { neon } from "@neondatabase/serverless";

const connection = process.env.DATABASE_URL;
if (!connection) throw new Error("DATABASE_URL não configurada.");
const sql = neon(connection);

const categories = [
  ["Energia solar", "energia-solar", "Guias e informações para entender a geração solar."],
  ["Instalação", "instalacao", "Planejamento, execução e cuidados com sistemas fotovoltaicos."],
  ["Eficiência", "eficiencia", "Boas práticas para aproveitar melhor a energia produzida."],
];

for (const [name, slug, description] of categories) {
  await sql.query(
    `insert into blog_categories (name, slug, description)
     values ($1, $2, $3)
     on conflict (slug) do nothing`,
    [name, slug, description],
  );
}

const authorRows = await sql.query(
  `select id from blog_authors where display_name = $1 limit 1`,
  ["Equipe Energy"],
);
let authorId = authorRows[0]?.id;
if (!authorId) {
  const inserted = await sql.query(
    `insert into blog_authors (display_name, job_title, biography)
     values ($1, $2, $3) returning id`,
    [
      "Equipe Energy",
      "Especialistas em energia solar",
      "Conteúdos preparados para tornar decisões sobre energia solar mais claras e bem informadas.",
    ],
  );
  authorId = inserted[0].id;
}

const categoryRows = await sql.query(
  `select id, slug from blog_categories where slug = any($1::text[])`,
  [categories.map((item) => item[1])],
);
const categoryId = Object.fromEntries(categoryRows.map((item) => [item.slug, item.id]));

const posts = [
  {
    title: "Energia solar residencial: o que avaliar antes de começar",
    slug: "energia-solar-residencial-o-que-avaliar-antes-de-comecar",
    subtitle: "Consumo, espaço disponível e condições do imóvel ajudam a orientar um projeto coerente.",
    summary: "Conheça os principais pontos que devem ser analisados antes de planejar um sistema de energia solar para sua residência.",
    image: "/images/solar/projeto-residencial.jpg",
    alt: "Painéis solares instalados no telhado de uma residência",
    category: "energia-solar",
    featured: true,
    daysAgo: 1,
    content: `<p>A decisão de instalar energia solar começa muito antes da fixação dos módulos. Um projeto bem orientado considera o perfil de consumo, as características do imóvel e os objetivos de quem utilizará o sistema.</p>
<h2>Entenda o consumo de energia</h2>
<p>As contas de energia dos últimos meses ajudam a visualizar como o consumo varia ao longo do ano. Essa leitura oferece uma base mais consistente para conversar sobre o dimensionamento do sistema.</p>
<h2>Avalie o espaço disponível</h2>
<p>Orientação do telhado, presença de sombras, condições da estrutura e área útil influenciam a organização dos módulos. Uma avaliação técnica identifica limitações e oportunidades antes da proposta.</p>
<h3>O que observar no imóvel</h3>
<ul><li>Condições e inclinação do telhado;</li><li>Sombras provocadas por árvores ou edificações;</li><li>Espaço para inversor e equipamentos de proteção;</li><li>Condições das instalações elétricas.</li></ul>
<h2>Defina seus objetivos</h2>
<p>É importante considerar possíveis mudanças de consumo, como aquisição de novos equipamentos, ampliação do imóvel ou adoção de veículos elétricos. Essas informações tornam a recomendação mais alinhada ao futuro da residência.</p>
<blockquote>Um bom projeto solar começa com dados claros e uma avaliação cuidadosa do cenário.</blockquote>
<h2>Converse com profissionais qualificados</h2>
<p>A análise técnica permite transformar as informações levantadas em uma proposta compreensível, com equipamentos, etapas e responsabilidades bem definidos.</p>`,
  },
  {
    title: "Como funciona a instalação de painéis solares",
    slug: "como-funciona-a-instalacao-de-paineis-solares",
    subtitle: "Do planejamento à ativação, cada etapa contribui para a segurança e o desempenho do sistema.",
    summary: "Veja como um projeto fotovoltaico sai do planejamento e chega à instalação, conexão e verificação final.",
    image: "/images/solar/equipe-instalacao.jpg",
    alt: "Profissionais instalando painéis solares em um telhado",
    category: "instalacao",
    featured: false,
    daysAgo: 4,
    content: `<p>A instalação de painéis solares reúne planejamento, trabalho em altura, montagem elétrica e verificação técnica. Conhecer as etapas ajuda o cliente a acompanhar o projeto com mais segurança.</p>
<h2>Planejamento e projeto</h2>
<p>Antes da instalação, a equipe avalia o local, define a disposição dos módulos e planeja o caminho dos cabos. O projeto também considera proteções elétricas e requisitos da distribuidora.</p>
<h2>Preparação da estrutura</h2>
<p>Os suportes são posicionados para receber os módulos sem comprometer a cobertura. O método de fixação varia conforme o tipo de telhado ou superfície disponível.</p>
<h3>Segurança durante a execução</h3>
<p>Trabalho em altura e intervenções elétricas exigem profissionais capacitados, equipamentos de proteção e procedimentos adequados. Segurança não deve ser tratada como uma etapa opcional.</p>
<h2>Montagem e conexão</h2>
<ol><li>Instalação das estruturas de suporte;</li><li>Fixação dos módulos fotovoltaicos;</li><li>Organização e proteção dos cabos;</li><li>Instalação do inversor;</li><li>Conexão ao quadro elétrico conforme o projeto.</li></ol>
<h2>Testes e entrega</h2>
<p>Após a montagem, a equipe verifica conexões, proteções e funcionamento. O cliente deve receber orientações sobre acompanhamento da geração, cuidados básicos e canais de suporte.</p>`,
  },
  {
    title: "Manutenção de sistemas solares: cuidados que fazem diferença",
    slug: "manutencao-de-sistemas-solares-cuidados-que-fazem-diferenca",
    subtitle: "Acompanhamento e inspeções ajudam a preservar o funcionamento do sistema ao longo do tempo.",
    summary: "Entenda quais sinais acompanhar e por que inspeções periódicas são importantes para um sistema fotovoltaico.",
    image: "/images/solar/manutencao-paineis.jpg",
    alt: "Conjunto de painéis solares instalado sobre um telhado",
    category: "eficiencia",
    featured: false,
    daysAgo: 8,
    content: `<p>Sistemas fotovoltaicos trabalham de forma silenciosa e automatizada, mas isso não significa que devam ser esquecidos. O acompanhamento da geração e inspeções periódicas ajudam a identificar alterações.</p>
<h2>Acompanhe a geração</h2>
<p>Aplicativos e plataformas de monitoramento facilitam a comparação do desempenho ao longo dos meses. Variações são naturais por causa do clima, mas quedas persistentes merecem avaliação.</p>
<h2>Observe o ambiente</h2>
<p>Acúmulo de sujeira, crescimento de vegetação, novas sombras e mudanças ao redor do imóvel podem afetar a incidência de luz sobre os módulos.</p>
<h3>Quando solicitar uma inspeção</h3>
<ul><li>Queda de geração sem causa aparente;</li><li>Alertas recorrentes no inversor;</li><li>Danos visíveis em cabos ou estruturas;</li><li>Intervenções recentes no telhado ou instalação elétrica.</li></ul>
<h2>Limpeza com segurança</h2>
<p>A necessidade de limpeza depende do local e das condições ambientais. Como os módulos normalmente ficam em altura, o serviço deve considerar acesso seguro e técnicas que não danifiquem as superfícies.</p>
<h2>Registre as intervenções</h2>
<p>Manter um histórico de inspeções, limpezas e ajustes facilita o acompanhamento e oferece informações úteis para atendimentos futuros.</p>`,
  },
  {
    title: "Energia renovável e eficiência: decisões que se complementam",
    slug: "energia-renovavel-e-eficiencia-decisoes-que-se-complementam",
    subtitle: "Gerar energia limpa é importante, mas entender como ela é utilizada amplia os benefícios.",
    summary: "Saiba por que geração solar e uso eficiente da energia devem fazer parte da mesma estratégia.",
    image: "/images/solar/energia-renovavel.jpg",
    alt: "Painéis solares e aerogeradores em uma paisagem ao entardecer",
    category: "eficiencia",
    featured: false,
    daysAgo: 12,
    content: `<p>A geração solar permite produzir eletricidade a partir de uma fonte renovável. Quando combinada com hábitos e equipamentos mais eficientes, ela ajuda a construir uma estratégia energética mais equilibrada.</p>
<h2>Conheça o perfil de consumo</h2>
<p>Entender quais equipamentos consomem mais e em quais horários eles são utilizados revela oportunidades de melhoria. Essa análise também contribui para o planejamento de um sistema solar.</p>
<h2>Priorize medidas de eficiência</h2>
<p>Iluminação adequada, equipamentos eficientes, manutenção e automação podem reduzir desperdícios sem comprometer o conforto ou a operação.</p>
<h3>Pequenas ações possíveis</h3>
<ul><li>Revisar horários de funcionamento;</li><li>Eliminar consumos desnecessários;</li><li>Acompanhar indicadores mensalmente;</li><li>Planejar a substituição de equipamentos antigos.</li></ul>
<h2>Integre geração e consumo</h2>
<p>A energia solar não deve ser analisada isoladamente. Uma visão integrada considera geração, consumo atual e possíveis mudanças futuras para apoiar decisões mais consistentes.</p>
<h2>Transforme dados em rotina</h2>
<p>Monitorar resultados e revisar hábitos periodicamente ajuda a manter a estratégia atualizada. Eficiência é um processo contínuo, não uma ação isolada.</p>`,
  },
];

for (const post of posts) {
  const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000);
  const words = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  await sql.query(
    `insert into blog_posts (
      title, slug, subtitle, summary, content, cover_image_url, cover_image_alt,
      cover_image_width, cover_image_height, status, is_featured, author_id,
      category_id, published_at, reading_time_minutes, meta_title, meta_description
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PUBLISHED',$10,$11,$12,$13,$14,$15,$16)
    on conflict (slug) do nothing`,
    [
      post.title, post.slug, post.subtitle, post.summary, post.content,
      post.image, post.alt, 1600, 1000, post.featured, authorId,
      categoryId[post.category], publishedAt, Math.max(1, Math.ceil(words / 220)),
      post.title.slice(0, 70), post.summary.slice(0, 170),
    ],
  );
}

console.log(`Seed concluído: ${posts.length} reportagens verificadas.`);
