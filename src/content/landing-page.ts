export const siteContent = {
  brand: "Energy",
  seo: {
    title: "Energy | Energia solar para decisões mais eficientes",
    description:
      "Converse com a Energy sobre energia solar e descubra o caminho mais adequado para a sua necessidade.",
  },
  contact: {
    // PENDENTE: substituir pelo e-mail comercial oficial.
    email: "[E-MAIL PENDENTE]",
    // PENDENTE: informar a URL oficial do WhatsApp, incluindo o número com DDI.
    whatsappUrl: "",
    // PENDENTE: informar cidades, estados ou regiões efetivamente atendidas.
    location: "[ÁREA DE ATENDIMENTO PENDENTE]",
    map: {
      title: "Mapa da área de atendimento da Energy em Luziânia, Goiás",
      embedUrl:
        "https://www.google.com/maps?q=Luzi%C3%A2nia%2C%20Goi%C3%A1s&output=embed",
    },
  },
  navigation: [
    { label: "Calculadora", href: "/#calculadora" },
    { label: "Soluções", href: "/#solucoes" },
    { label: "Quem somos", href: "/#quem-somos" },
    { label: "Processo", href: "/#processo" },
    { label: "FAQ", href: "/#faq" },
    { label: "BLOG", href: "/blog" },
  ],
  cta: {
    primary: "Solicitar uma proposta",
    secondary: "Falar com um especialista",
  },
  hero: {
    eyebrow: "ENERGIA SOLAR • ENERGY",
    titleStart: "Energia inteligente",
    titleMiddle: "para um futuro mais",
    titleAccent: "eficiente.",
    description:
      "Soluções solares orientadas ao seu consumo, ao seu espaço e às decisões que realmente importam.",
    trust: "Atendimento próximo, do primeiro contato à proposta.",
  },
  calculator: {
    id: "calculadora",
    eyebrow: "DESCUBRA O CUSTO DE ESPERAR",
    title: "Quanto dinheiro sua conta de luz ainda vai consumir?",
    description:
      "Faça uma simulação rápida e veja quanto você poderá gastar mantendo sua conta de energia como está.",
    experience: {
      label: "SIMULAÇÃO INTERATIVA",
      title: "Construa sua projeção em poucos segundos",
      liveSummaryLabel: "Configuração atual",
      monthlySuffix: "/ mês",
      monthlyAriaSuffix: "por mês",
      todayLabel: "Hoje",
      noAdjustmentLabel: "Sem reajuste",
      adjustmentSummaryPrefix: "reajuste de",
      adjustmentSummarySuffix: "a.a.",
      educationalNote: {
        title: "Estimativa educativa",
        description: "Sem promessas ou garantias comerciais.",
      },
      progressLabel: "Progresso da simulação",
      steps: ["Conta mensal", "Período", "Resultado"],
      highlights: [
        {
          title: "Resposta instantânea",
          description: "A projeção acompanha cada ajuste que você fizer.",
        },
        {
          title: "Critérios transparentes",
          description: "Você controla valor, período e possível reajuste.",
        },
        {
          title: "Estimativa responsável",
          description: "Sem promessas de economia ou retorno garantido.",
        },
      ],
    },
    monthlyBill: {
      label: "Valor médio mensal da conta de energia",
      hint: "Digite o valor ou ajuste pelo controle deslizante.",
      inputAriaLabel: "Valor médio mensal da conta de energia em reais",
      sliderAriaLabel: "Ajustar valor médio mensal da conta de energia",
      placeholder: "R$ 500,00",
      error: "Informe um valor mensal maior que zero.",
    },
    slider: {
      min: 100,
      max: 10_000,
      step: 50,
      default: 500,
    },
    horizons: [1, 5, 10, 25],
    horizon: {
      label: "Período da projeção",
      ariaLabel: "Selecionar período da projeção",
      yearSingular: "ano",
      yearPlural: "anos",
      default: 10,
    },
    advancedOptionsLabel: "Opções avançadas",
    annualAdjustment: {
      toggleLabel: "Considerar reajuste anual",
      description:
        "Inclua uma taxa configurável para simular o aumento anual da conta.",
      rateLabel: "Reajuste anual estimado",
      rateAriaLabel: "Taxa de reajuste anual em porcentagem",
      min: 0,
      max: 30,
      step: 0.5,
      default: 5,
      suffix: "% ao ano",
    },
    primaryCta: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE",
    result: {
      heading: "Resultado da projeção",
      intro:
        "Mantendo sua conta nesse valor, você poderá gastar aproximadamente:",
      annualSpendLabel: "Gasto aproximado em 12 meses",
      periodSpendLabel: "Gasto no período escolhido",
      dailyAverageLabel: "Média aproximada por dia",
      comparisonTitle: "Uma escolha sobre o destino do seu dinheiro",
      distributorLabel: "Dinheiro pago à distribuidora",
      ownGenerationLabel: "Possibilidade de investir na própria geração",
      ownGenerationValue: "Requer uma análise personalizada",
      editCta: "Ajustar simulação",
      followupCta: "Quero descobrir quanto posso economizar",
      disclaimer:
        "Esta é uma estimativa educativa baseada nos valores informados. A economia real depende da análise do consumo, das tarifas, do imóvel e do dimensionamento do sistema.",
    },
  },
  chat: {
    typingDelay: 450,
    trigger: {
      label: "Faça sua simulação",
      ariaLabel: "Abrir conversa para fazer uma simulação",
    },
    dialog: {
      title: "Simulação ENERGY",
      subtitle: "Converse com a nossa equipe",
      ariaLabel: "Conversa para simulação de energia solar",
      closeAriaLabel: "Fechar conversa",
    },
    typingLabel: "O assistente da ENERGY está digitando",
    progressLabel: "Progresso da conversa",
    welcome:
      "Olá! Eu sou o assistente da ENERGY. Posso fazer algumas perguntas rápidas para entendermos seu projeto?",
    prompts: {
      monthlyBill: "Qual é o valor médio da sua conta de luz?",
      prefilledMonthlyBill:
        "Já trouxe o valor usado na sua simulação. Você pode confirmar ou alterar.",
      customerType:
        "Esse projeto seria para sua casa, empresa ou propriedade rural?",
      companyName: "Qual é o nome da sua empresa?",
      location: "Em qual cidade e estado será feita a instalação?",
      name: "Como você gostaria de ser chamado?",
      whatsapp: "Qual é o seu WhatsApp?",
      email: "Qual é o seu melhor e-mail?",
      summary: "Confira se está tudo certo antes de enviar.",
      consent:
        "Para finalizar, preciso da sua autorização para enviar e tratar estes dados.",
    },
    fields: {
      monthlyBill: {
        label: "Valor médio da conta de luz",
        placeholder: "R$ 500,00",
      },
      companyName: {
        label: "Nome da empresa",
        placeholder: "Nome da empresa",
      },
      city: { label: "Cidade", placeholder: "Sua cidade" },
      state: { label: "Estado", placeholder: "UF" },
      name: { label: "Nome", placeholder: "Como podemos chamar você?" },
      whatsapp: {
        label: "WhatsApp",
        placeholder: "(00) 00000-0000",
      },
      email: { label: "E-mail", placeholder: "voce@exemplo.com" },
      honeypot: "Não preencha este campo",
    },
    customerTypes: [
      { value: "residential", label: "Residência" },
      { value: "business", label: "Empresa" },
      { value: "rural", label: "Propriedade rural" },
    ],
    quickReplies: {
      back: "Voltar",
      correct: "Corrigir resposta",
      continue: "Continuar",
      confirm: "Confirmar",
    },
    summary: {
      title: "Resumo das suas informações",
      monthlyBillLabel: "Conta mensal",
      customerTypeLabel: "Tipo de projeto",
      companyNameLabel: "Empresa",
      locationLabel: "Local da instalação",
      nameLabel: "Nome",
      whatsappLabel: "WhatsApp",
      emailLabel: "E-mail",
      horizonLabel: "Período da simulação",
      estimatedSpendLabel: "Gasto estimado sem energia solar",
    },
    consent: {
      labelBeforeLink:
        "Autorizo o envio e o tratamento dos meus dados pela ENERGY para contato sobre esta simulação, conforme a",
      privacyLinkLabel: "Política de Privacidade",
      labelAfterLink: ".",
      error: "Você precisa autorizar o envio e o tratamento dos dados.",
    },
    actions: {
      send: "Enviar para um especialista",
      sending: "Enviando...",
      restart: "Fazer uma nova simulação",
    },
    status: {
      success:
        "Recebemos seus dados. Um especialista da ENERGY poderá entrar em contato pelo canal informado.",
      error:
        "Não foi possível enviar seus dados. Revise as informações e tente novamente.",
    },
    errors: {
      monthlyBill: "Informe um valor de conta maior que zero.",
      customerType: "Selecione o tipo do projeto.",
      companyName: "Informe o nome da empresa.",
      city: "Informe a cidade da instalação.",
      state: "Informe o estado da instalação.",
      name: "Informe como você gostaria de ser chamado.",
      whatsapp: "Informe um WhatsApp válido com DDD.",
      email: "Informe um e-mail válido.",
    },
  },
  trust: [
    // PENDENTE: substituir apenas por segmentos efetivamente atendidos.
    "[SEGMENTOS ATENDIDOS]",
    // PENDENTE: publicar somente certificação oficial e verificável.
    "[CERTIFICAÇÃO]",
    // PENDENTE: publicar somente cliente ou parceiro com autorização.
    "[CLIENTE OU PARCEIRO]",
    // PENDENTE: publicar somente indicador comercial mensurado e verificável.
    "[INDICADOR REAL]",
  ],
  problem: {
    eyebrow: "ENERGIA SOLAR COM CONTEXTO",
    title: "Uma boa decisão começa antes da instalação.",
    problemTitle: "O desafio",
    problemText:
      "Consumo, características do imóvel e objetivos diferentes exigem uma análise cuidadosa. Uma recomendação genérica pode não refletir a necessidade real.",
    solutionTitle: "A resposta Energy",
    solutionText:
      "A Energy começa pelo entendimento do cenário para orientar uma solução de energia solar coerente com as informações levantadas.",
  },
  benefits: [
    {
      title: "Análise do cenário",
      text: "Uma conversa sobre consumo, imóvel, prioridades e condições relevantes para o projeto solar.",
    },
    {
      title: "Proposta compreensível",
      text: "Solução recomendada e próximos passos apresentados de forma clara para facilitar a decisão.",
    },
    {
      title: "Contato próximo",
      text: "Um canal direto para reduzir desencontros e manter as conversas relevantes.",
    },
    {
      title: "Projeto orientado à demanda",
      text: "A recomendação parte das informações do cliente, sem tratar necessidades diferentes como se fossem iguais.",
    },
  ],
  solutions: [
    {
      eyebrow: "PROJETO SOLAR",
      title: "Energia solar para residências",
      text: "Uma solução dimensionada a partir do perfil de consumo e das características do imóvel.",
      image: "/images/solar/projeto-residencial.jpg",
      alt: "Painéis solares instalados em telhado residencial",
    },
    {
      eyebrow: "EXECUÇÃO",
      title: "Instalação de painéis solares",
      text: "Planejamento e execução técnica para transformar o projeto em um sistema solar instalado.",
      image: "/images/solar/equipe-instalacao.jpg",
      alt: "Profissionais realizando a instalação de painéis solares",
    },
    {
      eyebrow: "CUIDADO CONTÍNUO",
      title: "Manutenção de sistemas solares",
      text: "Avaliação das condições do sistema e intervenções necessárias para preservar seu funcionamento.",
      image: "/images/solar/manutencao-paineis.jpg",
      alt: "Sistema de painéis solares instalado sobre telhado",
    },
    {
      eyebrow: "ESCALA",
      title: "Soluções para empresas e propriedades",
      text: "Análise orientada ao contexto de consumo para projetos que exigem maior área e capacidade.",
      image: "/images/solar/paineis-solares.jpg",
      alt: "Conjunto amplo de painéis solares",
    },
    {
      eyebrow: "ENERGIA RENOVÁVEL",
      title: "Um caminho para uma matriz mais limpa",
      text: "Tecnologia solar aplicada a uma estratégia de energia alinhada às necessidades de cada operação.",
      image: "/images/solar/energia-renovavel.jpg",
      alt: "Painéis solares e aerogeradores em paisagem ao entardecer",
    },
  ],
  process: [
    {
      title: "Você compartilha o cenário",
      text: "Conte sobre o imóvel, o consumo e o objetivo com energia solar.",
    },
    {
      title: "A Energy avalia",
      text: "A equipe analisa os dados iniciais e identifica informações complementares.",
    },
    {
      title: "Alinhamos o projeto",
      text: "Uma conversa valida necessidades, condições e próximos passos.",
    },
    {
      title: "Você recebe a proposta",
      text: "A solução solar recomendada é apresentada para sua avaliação.",
    },
  ],
  differentiators: [
    {
      label: "Ponto de partida",
      traditional: "Oferta previamente definida",
      energy: "Entendimento da necessidade",
    },
    {
      label: "Comunicação",
      traditional: "Informação dispersa",
      energy: "Próximos passos explícitos",
    },
    {
      label: "Decisão",
      traditional: "Critérios pouco visíveis",
      energy: "Contexto organizado para avaliar",
    },
  ],
  metrics: [
    { value: 7, suffix: "+", label: "Anos gerando economia" },
    { value: 35, suffix: "k", label: "MWh de energia gerada" },
    { value: 98, suffix: "%", label: "Clientes satisfeitos" },
  ],
  // PENDENTE: adicionar somente depoimento/case real, autorizado e identificável.
  testimonial: null,
  faqSection: {
    eyebrow: "FAQ",
    title: "Aproveite o sol e comece a economizar hoje!",
  },
  faq: [
    {
      q: "Vale a pena instalar energia solar?",
      a: "Sim! O sistema se paga em poucos anos e você economiza por mais de 25 anos.",
    },
    {
      q: "Quanto posso economizar na conta de luz?",
      a: "A economia varia conforme o consumo, a tarifa de energia, a incidência solar e o dimensionamento do sistema. Faça uma simulação para conhecer uma estimativa do seu cenário.",
    },
    {
      q: "Vocês atendem minha cidade?",
      a: "Informe sua cidade e estado no atendimento. Nossa equipe verifica a disponibilidade e orienta os próximos passos para a sua região.",
    },
    {
      q: "Como funciona o orçamento?",
      a: "Você compartilha sua conta de energia e os dados do imóvel. A Energy analisa o cenário e apresenta uma proposta dimensionada para a sua necessidade.",
    },
  ],
  pending: [
    // PENDENTE: remover cada item desta lista somente após preencher e validar o dado.
    "Segmentos atendidos",
    "Serviços solares incluídos",
    "Cliente ideal",
    "Diferencial comprovável",
    "WhatsApp",
    "E-mail",
    "Área de atendimento",
    "Garantias",
    "Provas sociais",
    "Depoimento",
  ],
} as const;
