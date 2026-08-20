export type NewsItem = {
  id: number | string; slug: string; title: string; category: string; date: string; dateISO: string;
  readTime: string; excerpt: string; sourceName?: string; sourceUrl?: string; image: string;
  imageAlt: string; featured?: boolean; trending?: boolean; views: number; keywords: string[];
  articleUrl?: string;
  managed?: boolean;
  content: string;
  published: boolean;
  highlight?: { label: string; value: string; complement: string };
  quote?: string;
};

type NewsSeed = Omit<NewsItem, "content" | "published" | "articleUrl">;

const newsSeeds: NewsSeed[] = [
  { id: 1, slug: "solar-armazenamento-transicao", title: "Energia solar e armazenamento ganham espaço no debate da transição energética", category: "Mercado", date: "11 de agosto de 2026", dateISO: "2026-08-11", readTime: "4 min de leitura", excerpt: "A fonte solar e os sistemas de armazenamento foram destaque em debate no Senado sobre o futuro das renováveis. Segundo a ABSOLAR, a energia fotovoltaica respondeu por 77% da potência renovável adicionada em 2025.", sourceName: "ABSOLAR", sourceUrl: "https://www.absolar.org.br/giro-absolar/no-senado-absolar-destaca-o-papel-da-fonte-solar-e-do-armazenamento-na-transicao-energetica-do-brasil-e-propoe-melhorias-ao-setor/", image: "/images/hero-solar-plant.webp", imageAlt: "Usina solar moderna ao entardecer", featured: true, trending: true, views: 970, keywords: ["baterias", "senado", "transição"] },
  { id: 2, slug: "bandeira-amarela-agosto-2026", title: "Bandeira amarela continua em agosto: entenda o impacto na conta de luz", category: "Economia", date: "31 de julho de 2026", dateISO: "2026-07-31", readTime: "3 min de leitura", excerpt: "A bandeira tarifária permanece amarela em agosto de 2026. A cobrança adicional é de R$ 1,885 para cada 100 kWh consumidos, reforçando a importância do consumo consciente.", sourceName: "ANEEL", sourceUrl: "https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/bandeira-tarifaria-continua-amarela-em-agosto", image: "/images/energy-solar-panels-hero.webp", imageAlt: "Residência equipada com painéis solares", trending: true, views: 880, keywords: ["tarifa", "conta", "consumo"] },
  { id: 3, slug: "brasil-43-milhoes-sistemas", title: "Brasil supera 4,3 milhões de sistemas solares distribuídos", category: "Projetos", date: "19 de junho de 2026", dateISO: "2026-06-19", readTime: "4 min de leitura", excerpt: "O Brasil alcançou aproximadamente 4,3 milhões de sistemas solares distribuídos conectados à rede. As residências representam 84% das conexões.", sourceName: "pv magazine Brasil", sourceUrl: "https://www.pv-magazine-brasil.com/2026/06/19/brasil-ultrapassa-43-milhoes-de-sistemas-solares-distribuidos-residencias-concentram-84-das-conexoes/", image: "/images/solar/projeto-residencial.jpg", imageAlt: "Telhado residencial com painéis solares", trending: true, views: 810, keywords: ["crescimento", "residências", "geração distribuída"] },
  { id: 4, slug: "geracao-solar-881-twh", title: "Geração solar cresce 24,7% e chega a 88,1 TWh no Brasil", category: "Sustentabilidade", date: "3 de junho de 2026", dateISO: "2026-06-03", readTime: "5 min de leitura", excerpt: "O Balanço Energético Nacional mostra que a geração solar alcançou 88,1 TWh em 2025 e capacidade instalada de 64.793 MW.", sourceName: "EPE", sourceUrl: "https://www.epe.gov.br/pt/imprensa/noticias/epe-publica-o-relatorio-sintese-do-balanco-energetico-nacional-2026", image: "/images/solar/paineis-solares.jpg", imageAlt: "Grande conjunto de painéis fotovoltaicos", views: 730, keywords: ["dados", "BEN", "capacidade"] },
  { id: 5, slug: "painel-interativo-epe", title: "EPE lança novo painel interativo sobre energia solar no Brasil", category: "Tecnologia", date: "25 de maio de 2026", dateISO: "2026-05-25", readTime: "3 min de leitura", excerpt: "A EPE lançou uma nova versão do painel de energia solar em Power BI, com mapas, gráficos e indicadores da geração brasileira.", sourceName: "EPE", sourceUrl: "https://www.epe.gov.br/pt/imprensa/noticias/dashboard-de-energia-solar-da-epe-ganha-nova-versao-em-power-bi-e-tem-dados-atualizados-ate-2025", image: "/images/solar/manutencao-paineis.jpg", imageAlt: "Painéis solares monitorados por tecnologia digital", views: 620, keywords: ["dashboard", "Power BI", "mapas"] },
  { id: 6, slug: "investimentos-300-bilhoes", title: "Investimentos em energia solar ultrapassam R$ 300 bilhões no Brasil", category: "Mercado", date: "28 de abril de 2026", dateISO: "2026-04-28", readTime: "4 min de leitura", excerpt: "Os investimentos acumulados em energia solar ultrapassaram R$ 300 bilhões, considerando a geração distribuída e grandes usinas fotovoltaicas.", sourceName: "ABSOLAR", sourceUrl: "https://www.absolar.org.br/home/investimentos-em-energia-solar-superam-r-300-bilhoes-no-brasil/", image: "/images/solar/energia-renovavel.jpg", imageAlt: "Painéis solares em paisagem de energia renovável", views: 680, keywords: ["investimento", "economia", "usinas"] },
  { id: 7, slug: "direitos-conexao-geracao", title: "ANEEL reforça direitos de consumidores na conexão da geração distribuída", category: "Regulamentação", date: "23 de julho de 2026", dateISO: "2026-07-23", readTime: "4 min de leitura", excerpt: "A ANEEL aplicou multa por irregularidades em pedidos de conexão de micro e minigeração, incluindo recusas indevidas e descumprimento de prazos.", sourceName: "ANEEL", sourceUrl: "https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/aneel-multa-neoenergia-coelba-por-irregularidades-envolvendo-a-geracao-distribuida", image: "/images/solar/equipe-instalacao.jpg", imageAlt: "Técnicos analisando uma instalação fotovoltaica", views: 790, keywords: ["direitos", "conexão", "fiscalização"] },
];

function completeArticle(item: NewsSeed) {
  const subjects = item.keywords.length
    ? item.keywords.join(", ")
    : "energia solar e mercado elétrico";

  return `<p>${item.excerpt}</p>
<h2>O que aconteceu</h2>
<p>A atualização divulgada por ${item.sourceName ?? "fontes do setor"} ajuda a entender o momento da energia solar no Brasil. Os dados colocam em perspectiva temas como ${subjects}, que influenciam consumidores, empresas e profissionais do mercado.</p>
<h2>Por que essa notícia importa</h2>
<p>Informações confiáveis permitem acompanhar custos, regras e oportunidades com mais clareza. Para quem avalia um sistema fotovoltaico, o contexto do setor complementa a análise técnica do imóvel, do consumo e das condições locais.</p>
<h2>Impactos para consumidores e empresas</h2>
<p>Os efeitos variam conforme o perfil de consumo, a distribuidora, a modalidade tarifária e as características de cada projeto. Por isso, números gerais devem ser usados como referência, sem substituir um estudo individualizado.</p>
<h2>O que acompanhar a partir de agora</h2>
<p>Vale observar novas publicações dos órgãos e entidades do setor, eventuais mudanças regulatórias e a evolução dos indicadores apresentados. A Energy Soluções acompanha esses movimentos para transformar informação técnica em decisões mais simples.</p>
<h2>Conclusão</h2>
<p>${item.title} é mais um sinal da transformação do setor elétrico. Informação, planejamento e acompanhamento profissional continuam essenciais para aproveitar os benefícios da energia solar com segurança.</p>`;
}

export const newsData: NewsItem[] = newsSeeds.map((item) => ({
  ...item,
  content: completeArticle(item),
  published: true,
  articleUrl: `/blog/${item.slug}`,
  ...(item.slug === "bandeira-amarela-agosto-2026" ? {
    highlight: { label: "Cobrança adicional", value: "R$ 1,885", complement: "a cada 100 kWh consumidos" },
    quote: "Entender o cenário atual é o primeiro passo para tomar decisões inteligentes sobre energia.",
  } : {}),
}));

export function getPublishedNewsBySlug(slug: string) {
  return newsData.find((item) => item.published && item.slug === slug) ?? null;
}
