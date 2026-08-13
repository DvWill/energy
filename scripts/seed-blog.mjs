import { neon } from "@neondatabase/serverless";

const connection = process.env.DATABASE_URL;
if (!connection) throw new Error("DATABASE_URL não configurada.");
const sql = neon(connection);

const categories = [
  ["Energia solar", "energia-solar", "Conceitos e respostas para entender a geração fotovoltaica."],
  ["Economia", "economia", "Planejamento e leitura dos impactos financeiros da energia."],
  ["Guias", "guias", "Orientações práticas para decisões mais bem informadas."],
  ["Tecnologia", "tecnologia", "Equipamentos e configurações de sistemas fotovoltaicos."],
  ["Instalação", "instalacao", "Planejamento e cuidados na implantação de sistemas solares."],
  ["Manutenção", "manutencao", "Acompanhamento e conservação de sistemas fotovoltaicos."],
  ["Empresas", "empresas", "Energia solar aplicada a operações comerciais e industriais."],
];

const images = {
  panels: ["/images/solar/paineis-solares.jpg", "Módulos fotovoltaicos instalados para captar a luz do sol", 3500, 2325],
  project: ["/images/solar/projeto-residencial.jpg", "Painéis solares instalados no telhado de uma residência", 1280, 640],
  install: ["/images/solar/equipe-instalacao.jpg", "Profissionais realizando a instalação de painéis solares", 1280, 853],
  maintenance: ["/images/solar/manutencao-paineis.jpg", "Painéis solares preparados para inspeção e manutenção", 1280, 640],
  renewable: ["/images/solar/energia-renovavel.jpg", "Painéis solares em uma paisagem de geração renovável", 612, 408],
};

const posts = [
  {
    title: "Como funciona a energia solar fotovoltaica",
    slug: "como-funciona-energia-solar-fotovoltaica",
    subtitle: "Da luz do sol à tomada, entenda o caminho percorrido pela energia em um sistema conectado à rede.",
    summary: "Entenda como a luz do sol é transformada em eletricidade e como módulos, inversor, proteções, medidor e monitoramento trabalham juntos.",
    category: "energia-solar",
    image: images.panels,
    featured: true,
    daysAgo: 1,
    metaTitle: "Como funciona a energia solar fotovoltaica | Energy",
    metaDescription: "Entenda como painéis, inversor, proteções e medidor transformam a luz do sol em eletricidade para residências e empresas.",
    content: `<p>A energia solar fotovoltaica aproveita a luz do sol para produzir eletricidade. O processo acontece de forma silenciosa e automática, mas envolve diferentes equipamentos trabalhando em conjunto. Conhecer esse caminho ajuda a comparar propostas e acompanhar o desempenho do sistema.</p>
<h2>A conversão começa nos módulos fotovoltaicos</h2>
<p>As células presentes nos módulos reagem à radiação solar e geram eletricidade em corrente contínua. A produção varia ao longo do dia conforme a disponibilidade de luz, a temperatura, a orientação dos painéis e possíveis sombras. Por isso, dois imóveis com áreas parecidas podem precisar de projetos diferentes.</p>
<p>Os módulos são organizados em conjuntos definidos pelo projeto elétrico. Cabos e conectores apropriados conduzem a energia até o inversor, enquanto estruturas de fixação mantêm os equipamentos firmes e ventilados.</p>
<h2>O inversor prepara a energia para o imóvel</h2>
<p>A maior parte das instalações utiliza corrente alternada. O inversor converte a corrente contínua dos módulos para o padrão usado pelos equipamentos do imóvel. Ele também acompanha parâmetros elétricos, registra a geração e interrompe a operação quando identifica condições fora dos limites de segurança.</p>
<h3>Proteções fazem parte do sistema</h3>
<p>Dispositivos de seccionamento, proteção contra surtos, aterramento e organização dos circuitos são definidos conforme o projeto e as características da instalação. Eles não são acessórios: integram a segurança elétrica do conjunto.</p>
<h2>Como a energia é utilizada</h2>
<p>Durante o dia, a eletricidade gerada atende primeiro os equipamentos que estão ligados no imóvel. Quando há excedente em um sistema conectado à rede, essa energia pode ser enviada para a distribuidora e registrada pelo medidor bidirecional. Quando a geração não cobre o consumo, a rede complementa o fornecimento.</p>
<p>As regras de compensação, cobranças e procedimentos dependem da regulamentação vigente e da distribuidora local. Uma análise deve considerar a fatura, o perfil de consumo e as regras aplicáveis no momento do projeto.</p>
<h2>O que acontece à noite e em dias nublados</h2>
<p>Sem luz, os módulos não geram energia. Em dias nublados, podem continuar produzindo, porém com resultado diferente do observado em céu aberto. Sistemas conectados à rede usam o fornecimento da distribuidora quando necessário; já configurações com armazenamento dependem do projeto e das baterias disponíveis.</p>
<h2>Monitoramento transforma geração em informação</h2>
<p>Plataformas de monitoramento mostram a produção ao longo do tempo e podem emitir alertas. A comparação deve considerar sazonalidade e clima, evitando conclusões baseadas em um único dia. Quedas persistentes ou mensagens de erro merecem avaliação técnica.</p>
<blockquote>Um sistema fotovoltaico é o resultado da integração entre módulos, inversor, proteções, instalação elétrica, medição e acompanhamento.</blockquote>
<h2>Conclusão</h2>
<p>Energia solar não se resume aos painéis visíveis no telhado. Um projeto coerente combina dimensionamento, equipamentos compatíveis, instalação segura e suporte. Antes de contratar, peça uma proposta que explique cada componente e as premissas usadas na estimativa de geração.</p>`,
  },
  {
    title: "Como avaliar se vale a pena instalar energia solar",
    slug: "como-avaliar-se-energia-solar-vale-a-pena",
    subtitle: "Consumo, imóvel, tarifa e objetivos precisam ser analisados em conjunto.",
    summary: "Conheça os fatores que influenciam a viabilidade de um projeto solar e organize uma avaliação adequada à realidade do seu imóvel.",
    category: "economia",
    image: images.project,
    daysAgo: 3,
    metaTitle: "Como saber se energia solar vale a pena | Energy",
    metaDescription: "Veja quais dados de consumo, imóvel, tarifa e orçamento devem entrar em uma análise personalizada de energia solar.",
    content: `<p>A pergunta “energia solar vale a pena?” não tem uma resposta única. A viabilidade depende do consumo, das condições do imóvel, das tarifas, do projeto e dos objetivos de quem investe. Uma boa decisão nasce de dados reais, não de uma promessa genérica.</p>
<h2>Comece pelo histórico de consumo</h2>
<p>Reúna as contas de energia de pelo menos doze meses para observar variações sazonais. Verifique consumo em quilowatt-hora, valores cobrados e mudanças recentes na rotina. Uma média isolada pode esconder períodos de maior uso, férias ou equipamentos adicionados ao imóvel.</p>
<h3>Pense também no consumo futuro</h3>
<p>Ar-condicionado, ampliação da empresa, aquecimento elétrico e veículo eletrificado podem mudar o perfil de carga. Essas possibilidades devem ser informadas ao projetista, mas precisam ser tratadas como cenários, não como consumo já existente.</p>
<h2>Avalie o local da instalação</h2>
<p>Área útil, orientação, inclinação, sombreamento e estado da estrutura influenciam a disposição dos módulos. Às vezes, o telhado principal não é a melhor opção; coberturas de estacionamento ou estruturas no solo podem entrar na análise quando tecnicamente adequadas.</p>
<p>Uma visita técnica reduz incertezas e ajuda a antecipar reforços, adequações elétricas e dificuldades de acesso. Esses fatores também interferem no orçamento.</p>
<h2>Entenda a proposta financeira</h2>
<p>Compare o investimento total, as premissas de geração, os componentes incluídos e os serviços cobertos. Projeções dependem de tarifas e regras que podem mudar, por isso devem apresentar hipóteses claras e, de preferência, mais de um cenário.</p>
<ul><li>Confira se o orçamento inclui projeto, instalação e homologação;</li><li>entenda as condições de pagamento e financiamento;</li><li>verifique garantias de equipamentos e do serviço;</li><li>considere manutenção e eventuais adequações;</li><li>desconfie de economia ou prazo de retorno garantidos.</li></ul>
<h2>Considere o tempo de permanência no imóvel</h2>
<p>Planos de mudança, alterações no uso do prédio ou reformas próximas podem influenciar a decisão. Também é importante entender como o sistema será documentado e como as garantias poderão ser acionadas no futuro.</p>
<h2>Compare alternativas equivalentes</h2>
<p>Propostas com potências, marcas e escopos diferentes não devem ser comparadas apenas pelo preço final. Peça que cada empresa explique a estimativa anual, as perdas consideradas e os limites do fornecimento. Um projeto menor e coerente pode ser mais adequado que um conjunto superdimensionado.</p>
<h2>Conclusão</h2>
<p>A melhor resposta vem de uma análise personalizada. Organize suas faturas, registre planos futuros e permita uma avaliação técnica do imóvel. Com as premissas documentadas, fica mais fácil comparar riscos, benefícios e alternativas sem depender de promessas.</p>`,
  },
  {
    title: "Como dimensionar um sistema de energia solar",
    slug: "como-dimensionar-sistema-energia-solar",
    subtitle: "Potência instalada é consequência de consumo, localização, perdas e espaço disponível.",
    summary: "Veja quais informações entram no dimensionamento de um sistema fotovoltaico e por que copiar o projeto de outro imóvel não funciona.",
    category: "guias",
    image: images.panels,
    daysAgo: 5,
    metaTitle: "Como dimensionar um sistema de energia solar | Energy",
    metaDescription: "Conheça os dados usados para definir potência, quantidade de módulos, inversor e expectativa de geração de um sistema solar.",
    content: `<p>Dimensionar um sistema fotovoltaico significa relacionar a energia que o imóvel consome com a energia que pode ser produzida no local. O cálculo exige dados de consumo, radiação solar, características físicas e perdas. Não se resume a dividir o valor da conta pela potência de um painel.</p>
<h2>Histórico de consumo é o ponto de partida</h2>
<p>As faturas mostram o consumo mensal e ajudam a identificar sazonalidade. O projetista também deve entender os horários de uso, especialmente em empresas, e separar eventos atípicos. Mudanças planejadas precisam aparecer como cenários adicionais.</p>
<h2>Localização altera a expectativa de geração</h2>
<p>A disponibilidade de radiação solar varia entre regiões e épocas do ano. Bases de dados e ferramentas de simulação auxiliam a estimativa, mas o resultado depende das coordenadas, do clima e das premissas escolhidas. A previsão representa uma referência, não uma garantia diária.</p>
<h2>Orientação, inclinação e sombras importam</h2>
<p>O levantamento do local identifica superfícies disponíveis e obstáculos. Árvores, caixas d'água, antenas e construções vizinhas podem projetar sombras em horários específicos. A distribuição dos módulos deve considerar essas interferências e a facilidade de manutenção.</p>
<h3>Perdas consideradas no projeto</h3>
<ul><li>Temperatura de operação dos módulos;</li><li>conversão realizada pelo inversor;</li><li>cabos e conexões elétricas;</li><li>diferenças entre módulos;</li><li>sombreamento e sujeira esperados;</li><li>indisponibilidade eventual do sistema.</li></ul>
<h2>Compatibilidade entre módulos e inversor</h2>
<p>A potência nominal dos módulos é apenas uma das variáveis. Tensões, correntes, número de entradas, faixas de operação e condições ambientais precisam respeitar os limites do equipamento. A escolha também considera a disposição física e possíveis orientações diferentes no telhado.</p>
<h2>A área disponível pode limitar o desenho</h2>
<p>Dimensões dos módulos, corredores de acesso, afastamentos e resistência da cobertura determinam a quantidade que pode ser instalada com segurança. Quando a área não comporta toda a meta de geração, o projeto deve explicitar a limitação e apresentar alternativas realistas.</p>
<h2>Por que evitar o superdimensionamento automático</h2>
<p>Adicionar módulos sem analisar consumo, regras de compensação e capacidade da instalação pode aumentar o investimento sem entregar o benefício esperado. A margem para crescimento deve ser justificada por planos concretos e pela viabilidade elétrica e regulatória.</p>
<h2>Conclusão</h2>
<p>Um dimensionamento responsável documenta dados, hipóteses e limites. Peça a memória de cálculo, a estimativa mensal e a lista dos equipamentos. Essas informações tornam a proposta comparável e ajudam a acompanhar o sistema depois da instalação.</p>`,
  },
  {
    title: "Energia solar on-grid, off-grid e híbrida: entenda as diferenças",
    slug: "energia-solar-on-grid-off-grid-hibrida",
    subtitle: "Conexão com a rede e armazenamento definem como cada configuração opera.",
    summary: "Compare sistemas on-grid, off-grid e híbridos e entenda como rede elétrica, baterias, autonomia, complexidade e objetivos influenciam a escolha.",
    category: "tecnologia",
    image: images.renewable,
    daysAgo: 7,
    metaTitle: "Energia solar on-grid, off-grid e híbrida | Energy",
    metaDescription: "Compare sistemas solares conectados à rede, isolados e híbridos, incluindo baterias, autonomia, limitações e aplicações.",
    content: `<p>Os termos on-grid, off-grid e híbrido descrevem maneiras diferentes de organizar geração, rede elétrica e armazenamento. Nenhuma configuração é automaticamente superior: a escolha depende da disponibilidade da rede, das cargas que precisam ser atendidas e do orçamento.</p>
<h2>Sistema on-grid</h2>
<p>O sistema on-grid opera conectado à rede da distribuidora. A energia solar atende o consumo instantâneo e o excedente pode ser injetado na rede conforme as regras aplicáveis. Quando a geração é insuficiente, a rede complementa o fornecimento.</p>
<p>Por segurança, inversores convencionais conectados à rede deixam de energizar o circuito durante uma interrupção. Portanto, ter painéis no telhado não significa manter o imóvel ligado em um apagão.</p>
<h2>Sistema off-grid</h2>
<p>O off-grid funciona sem depender da rede pública. Em geral, combina módulos, controladores, baterias e inversor adequado. O dimensionamento considera não só o consumo médio, mas os picos de potência e o período desejado de autonomia.</p>
<p>Essa configuração pode ser útil em locais remotos, mas exige gestão cuidadosa. Dias com menor geração, envelhecimento das baterias e aumento de carga precisam ser previstos para evitar falta de energia.</p>
<h2>Sistema híbrido</h2>
<p>Sistemas híbridos integram mais de uma fonte ou possibilidade de armazenamento. Uma configuração pode combinar painéis, rede e bateria, definindo prioridades de uso. O comportamento durante uma falta de energia depende do inversor, do quadro de cargas de backup e do projeto.</p>
<h3>O papel das baterias</h3>
<p>Baterias armazenam energia para uso posterior, mas acrescentam custo, espaço, controles e requisitos de segurança. Capacidade em quilowatt-hora, potência de descarga, profundidade de uso, vida útil e compatibilidade são parâmetros relevantes.</p>
<h2>Comparando as configurações</h2>
<ul><li><strong>On-grid:</strong> prioriza integração com a rede e normalmente não usa baterias;</li><li><strong>off-grid:</strong> atende locais isolados e depende de geração e armazenamento próprios;</li><li><strong>híbrido:</strong> combina recursos e pode manter cargas selecionadas, conforme o projeto.</li></ul>
<h2>Perguntas que orientam a escolha</h2>
<p>Existe rede confiável no local? Quais equipamentos não podem parar? Por quanto tempo eles precisam operar? Qual é a potência simultânea? Há espaço adequado para baterias? As respostas definem o escopo e evitam comprar uma solução incompatível com a necessidade.</p>
<h2>Conclusão</h2>
<p>Antes de escolher uma categoria de sistema, descreva o problema que precisa ser resolvido. Um profissional qualificado deve transformar esse objetivo em requisitos de carga, autonomia, proteção e manutenção, respeitando normas e regras vigentes.</p>`,
  },
  {
    title: "O que analisar no telhado antes de instalar painéis solares",
    slug: "o-que-analisar-telhado-paineis-solares",
    subtitle: "Estrutura, cobertura, sombras e acesso influenciam segurança e desempenho.",
    summary: "Saiba quais características do telhado devem ser verificadas antes da instalação de painéis solares e como uma vistoria reduz imprevistos.",
    category: "instalacao",
    image: images.install,
    daysAgo: 9,
    metaTitle: "Telhado para painéis solares: o que analisar | Energy",
    metaDescription: "Veja como estrutura, cobertura, orientação, sombras, espaço e acesso devem ser avaliados antes de instalar painéis solares.",
    content: `<p>O telhado sustenta os módulos durante muitos anos e precisa oferecer condições seguras para instalação e manutenção. Uma avaliação feita antes da proposta reduz mudanças de escopo e ajuda a definir a melhor distribuição dos equipamentos.</p>
<h2>Estado da estrutura</h2>
<p>Madeiramento, perfis metálicos, lajes e pontos de apoio devem estar em boas condições. Sinais de infiltração, corrosão, deformação ou peças soltas merecem avaliação específica. Quando necessário, reparos e reforços devem acontecer antes da montagem.</p>
<p>A análise estrutural precisa considerar o peso dos equipamentos e as ações do vento. Situações complexas exigem profissional habilitado e documentação compatível com o serviço.</p>
<h2>Tipo e conservação da cobertura</h2>
<p>Telhas cerâmicas, metálicas, fibrocimento e coberturas planas utilizam soluções de fixação diferentes. O método deve preservar a estanqueidade e transferir esforços para a estrutura correta, sem apoiar cargas indevidas apenas sobre a telha.</p>
<h2>Orientação e inclinação</h2>
<p>A geometria do telhado influencia a incidência solar ao longo do ano. Nem sempre existe uma única face ideal; o projeto pode distribuir módulos em orientações distintas e usar entradas separadas do inversor. O resultado deve ser simulado para o local.</p>
<h2>Sombras atuais e futuras</h2>
<p>Observe árvores, prédios vizinhos, chaminés, antenas e reservatórios. Uma sombra pequena pode afetar parte do conjunto, dependendo da configuração elétrica. Também vale considerar vegetação em crescimento e construções planejadas no entorno.</p>
<h3>Espaço que não deve ser ocupado</h3>
<ul><li>Áreas frágeis ou com reparos pendentes;</li><li>rotas necessárias para manutenção;</li><li>pontos de drenagem e calhas;</li><li>equipamentos que precisam de acesso;</li><li>afastamentos definidos pelo projeto e pelas regras aplicáveis.</li></ul>
<h2>Caminho de cabos e localização do inversor</h2>
<p>A vistoria deve planejar como os cabos chegarão ao inversor e ao quadro elétrico, evitando trajetos expostos ou improvisados. O inversor precisa de local compatível com as orientações do fabricante, ventilação e acesso para leitura e manutenção.</p>
<h2>Segurança e acesso</h2>
<p>A execução envolve trabalho em altura. Pontos de ancoragem, acesso ao telhado, isolamento da área e condições climáticas fazem parte do planejamento. A futura limpeza ou inspeção também deve ser possível sem desmontagens desnecessárias.</p>
<h2>Conclusão</h2>
<p>Fotos ajudam, mas não substituem uma vistoria quando há dúvidas sobre estrutura, sombras ou instalações elétricas. Solicite que a proposta registre as condições encontradas, as adequações previstas e o método de fixação.</p>`,
  },
  {
    title: "Manutenção de painéis solares: cuidados essenciais",
    slug: "manutencao-paineis-solares-cuidados-essenciais",
    subtitle: "Monitoramento e inspeções ajudam a identificar mudanças antes que se tornem problemas maiores.",
    summary: "Descubra como acompanhar a geração, quando avaliar limpeza e quais sinais indicam a necessidade de assistência técnica em um sistema solar.",
    category: "manutencao",
    image: images.maintenance,
    daysAgo: 11,
    metaTitle: "Manutenção de painéis solares: guia essencial | Energy",
    metaDescription: "Aprenda a monitorar a geração, avaliar limpeza e reconhecer sinais que pedem inspeção profissional em sistemas fotovoltaicos.",
    content: `<p>Sistemas fotovoltaicos têm operação automatizada, mas não devem ser esquecidos depois da instalação. Acompanhamento, limpeza quando necessária e inspeções qualificadas ajudam a preservar segurança e desempenho.</p>
<h2>Use o monitoramento como referência</h2>
<p>Observe a geração em períodos comparáveis e considere clima e sazonalidade. Um dia nublado não indica defeito, mas uma queda persistente sem explicação pode justificar uma verificação. Configure alertas disponíveis no aplicativo do inversor e mantenha o acesso atualizado.</p>
<h2>Faça inspeções visuais sem se expor a riscos</h2>
<p>Do solo ou de local seguro, procure objetos sobre os módulos, vegetação criando sombras e alterações aparentes na estrutura. Não suba no telhado sem treinamento e proteção. Cabos, conectores e quadros elétricos devem ser avaliados por profissionais.</p>
<h2>Quando os módulos precisam de limpeza</h2>
<p>A frequência depende da chuva, inclinação, poeira, poluição, aves e vegetação do entorno. Antes de limpar, compare o histórico de geração e avalie visualmente o acúmulo. Limpezas desnecessárias aumentam exposição a trabalho em altura.</p>
<h3>Cuidados durante a limpeza</h3>
<ul><li>Siga as orientações do fabricante;</li><li>evite produtos abrasivos e ferramentas que risquem o vidro;</li><li>não pise sobre os módulos;</li><li>considere temperatura e risco de choque térmico;</li><li>use equipe preparada para trabalho em altura.</li></ul>
<h2>Sinais que pedem assistência técnica</h2>
<p>Alertas recorrentes no inversor, cheiro incomum, ruídos, aquecimento anormal, disjuntores desarmando, cabos danificados ou estrutura solta precisam de atenção. Não abra equipamentos nem faça conexões improvisadas.</p>
<h2>Inspeção elétrica e mecânica</h2>
<p>Uma revisão profissional pode verificar aperto e integridade das conexões, proteções, aterramento, fixações, corrosão e condições do inversor. O escopo e a periodicidade dependem do ambiente, do sistema e das recomendações dos fabricantes.</p>
<h2>Mantenha documentação e histórico</h2>
<p>Guarde projeto, notas fiscais, manuais, garantias, registros de geração e relatórios de serviço. Fotografias datadas e anotações sobre intervenções ajudam a identificar tendências e tornam o atendimento mais eficiente.</p>
<h2>Conclusão</h2>
<p>Manutenção começa com observação regular, não com intervenções frequentes. Acompanhe os dados, mantenha o entorno sob controle e acione assistência quando houver sinais consistentes de alteração.</p>`,
  },
  {
    title: "Como ler a conta de luz de um imóvel com energia solar",
    slug: "como-ler-conta-luz-com-energia-solar",
    subtitle: "Consumo, energia injetada e créditos aparecem em campos diferentes da fatura.",
    summary: "Aprenda a identificar consumo da rede, energia injetada, saldo de créditos e cobranças que podem aparecer na conta depois da instalação solar.",
    category: "economia",
    image: images.project,
    daysAgo: 13,
    metaTitle: "Como ler a conta de luz com energia solar | Energy",
    metaDescription: "Entenda consumo da rede, energia injetada, créditos e cobranças na fatura de um imóvel com geração solar fotovoltaica.",
    content: `<p>Depois que o sistema solar entra em operação, a conta de luz passa a reunir informações de consumo e de energia enviada à rede. Os nomes e a organização variam entre distribuidoras, mas alguns conceitos ajudam a interpretar a fatura.</p>
<h2>Geração não é igual à energia injetada</h2>
<p>O aplicativo do inversor mostra quanto o sistema produziu. Parte dessa energia pode ser consumida imediatamente no imóvel, antes de passar pelo medidor. Apenas o excedente é enviado à rede e aparece como energia injetada.</p>
<p>Por isso, não é correto comparar diretamente toda a geração do aplicativo com o valor de injeção da fatura. Para entender o comportamento, considere também o consumo simultâneo durante o dia.</p>
<h2>Consumo medido da rede</h2>
<p>Quando o imóvel precisa de mais energia do que os painéis estão produzindo, recebe a diferença da distribuidora. Esse consumo pode ocorrer à noite, em dias de baixa geração ou em momentos de alta demanda.</p>
<h2>Energia injetada e compensação</h2>
<p>O medidor bidirecional registra o fluxo enviado à rede. A fatura pode mostrar a quantidade usada para compensar consumo e o saldo remanescente, conforme regras vigentes e enquadramento da unidade consumidora.</p>
<h3>Campos úteis para conferir</h3>
<ul><li>Leituras atual e anterior do medidor;</li><li>consumo faturado no período;</li><li>energia injetada;</li><li>créditos utilizados e saldo;</li><li>datas de leitura e número de dias do ciclo;</li><li>bandeiras, tributos e demais cobranças discriminadas.</li></ul>
<h2>Por que a conta não necessariamente zera</h2>
<p>Podem permanecer custos mínimos, disponibilidade, demanda, iluminação pública, tributos ou outras parcelas, dependendo do grupo tarifário, das regras e do município. A proposta comercial deve explicar que geração solar não elimina automaticamente todos os itens da fatura.</p>
<h2>Compare períodos equivalentes</h2>
<p>Use datas do mesmo ciclo e verifique se o aplicativo está no fuso correto. Clima, estação do ano, sujeira, mudança de consumo e indisponibilidade da rede podem causar diferenças. Uma comparação mensal costuma ser mais útil do que observar apenas um dia.</p>
<h2>Quando pedir esclarecimentos</h2>
<p>Procure a distribuidora se houver leituras incoerentes, ausência de campos esperados ou dúvidas sobre compensação. Para diferenças entre geração e comportamento do sistema, consulte a empresa instaladora com a fatura e os dados do monitoramento em mãos.</p>
<h2>Conclusão</h2>
<p>A fatura mostra a relação do imóvel com a rede; o monitoramento mostra a produção solar. Interpretar os dois conjuntos de dados permite acompanhar o projeto com mais clareza.</p>`,
  },
  {
    title: "Principais mitos e verdades sobre energia solar",
    slug: "mitos-verdades-energia-solar",
    subtitle: "Geração em dias nublados, apagões, limpeza e durabilidade sem respostas simplistas.",
    summary: "Esclareça dúvidas comuns sobre funcionamento à noite, geração com nuvens, resistência dos módulos, limpeza, segurança e autonomia em apagões.",
    category: "energia-solar",
    image: images.renewable,
    daysAgo: 15,
    metaTitle: "Mitos e verdades sobre energia solar | Energy",
    metaDescription: "Esclareça dúvidas sobre dias nublados, noite, apagões, limpeza, segurança e durabilidade de sistemas de energia solar.",
    content: `<p>A energia solar se tornou mais conhecida, mas algumas afirmações ainda misturam conceitos diferentes. Separar mitos de verdades ajuda a formar expectativas realistas e a fazer perguntas melhores durante a contratação.</p>
<h2>“Painel solar não gera em dia nublado”</h2>
<p><strong>Mito.</strong> Os módulos podem produzir com radiação difusa, mesmo sem sol direto. A geração tende a ser diferente daquela observada em céu aberto e varia conforme a intensidade das nuvens e as condições do sistema.</p>
<h2>“Painel solar gera energia à noite”</h2>
<p><strong>Mito.</strong> Sem luz, não há geração fotovoltaica. Um imóvel conectado à rede utiliza energia da distribuidora quando necessário. Sistemas com baterias podem usar energia armazenada, respeitando a capacidade e a estratégia definida no projeto.</p>
<h2>“Ter painéis mantém tudo ligado durante apagões”</h2>
<p><strong>Mito para sistemas on-grid convencionais.</strong> Eles interrompem o fornecimento por segurança quando a rede cai. Backup exige equipamentos compatíveis, isolamento adequado e definição das cargas que serão atendidas.</p>
<h2>“Módulos precisam de limpeza toda semana”</h2>
<p><strong>Mito.</strong> A necessidade depende do ambiente, da chuva, da inclinação e do tipo de sujeira. Monitoramento e inspeção ajudam a decidir. Qualquer acesso ao telhado deve respeitar procedimentos de segurança.</p>
<h2>“Qualquer sombra pequena é irrelevante”</h2>
<p><strong>Mito.</strong> O impacto depende do horário, do desenho elétrico, do equipamento e da posição da sombra. Um estudo do local permite estimar perdas e ajustar a distribuição dos módulos.</p>
<h2>“Os módulos são projetados para ficar ao ar livre”</h2>
<p><strong>Verdade.</strong> Equipamentos certificados são desenvolvidos para exposição ambiental dentro de condições especificadas. Isso não elimina a necessidade de instalação correta, estrutura adequada e inspeção após eventos severos.</p>
<h2>“Energia solar elimina toda cobrança da fatura”</h2>
<p><strong>Mito.</strong> A conta pode manter custos e encargos conforme modalidade, regulamentação e localidade. Além disso, o resultado depende do consumo e da geração no período.</p>
<h2>“Uma estimativa de geração é uma garantia mensal”</h2>
<p><strong>Mito.</strong> Simulações usam dados históricos e hipóteses. Clima, temperatura, indisponibilidade da rede, sombreamento e manutenção afetam o resultado. A avaliação deve considerar períodos mais longos.</p>
<h2>Conclusão</h2>
<p>Desconfie de frases absolutas. Peça explicações baseadas no tipo de sistema e nas condições do imóvel. Uma proposta transparente mostra premissas, limitações e responsabilidades.</p>`,
  },
  {
    title: "Como escolher uma empresa de energia solar",
    slug: "como-escolher-empresa-energia-solar",
    subtitle: "Uma boa proposta explica premissas, equipamentos, responsabilidades e suporte.",
    summary: "Confira o que avaliar no levantamento técnico, na proposta, nos equipamentos, nas garantias, na segurança e no atendimento pós-venda.",
    category: "guias",
    image: images.install,
    daysAgo: 17,
    metaTitle: "Como escolher uma empresa de energia solar | Energy",
    metaDescription: "Saiba comparar propostas, equipamentos, garantias, segurança da instalação e suporte antes de contratar uma empresa de energia solar.",
    content: `<p>Escolher uma empresa de energia solar envolve mais do que comparar o menor preço. O projeto ficará ligado à instalação elétrica e exposto ao ambiente por muitos anos. Qualidade de engenharia, execução e suporte precisam entrar na decisão.</p>
<h2>Avalie como os dados são levantados</h2>
<p>A empresa deve pedir faturas, endereço, informações do imóvel e planos de consumo. Quando as condições não podem ser confirmadas remotamente, uma vistoria ajuda a verificar telhado, sombras, quadro elétrico, acesso e caminho dos cabos.</p>
<h2>Exija uma proposta clara</h2>
<p>O documento deve identificar potência, quantidade e modelo dos equipamentos, estimativa de geração, escopo de instalação, adequações, prazos e responsabilidades. Premissas sobre tarifa e economia precisam estar explícitas.</p>
<h3>Perguntas importantes</h3>
<ul><li>Quais serviços estão incluídos e excluídos?</li><li>Quem responde pelo projeto e pela instalação?</li><li>Como foram calculadas geração e perdas?</li><li>O que acontece se a vistoria revelar uma adequação?</li><li>Como funciona o atendimento depois da entrega?</li></ul>
<h2>Confira equipamentos e compatibilidade</h2>
<p>Marca conhecida não substitui o dimensionamento. Peça fichas técnicas e verifique se módulos, inversor, estruturas e proteções são adequados entre si e ao ambiente. Entenda também o acesso ao aplicativo de monitoramento.</p>
<h2>Diferencie as garantias</h2>
<p>Pode haver garantias diferentes para produto, desempenho, instalação e serviços. Leia prazos, condições, responsáveis e procedimento de acionamento. Confirme quem prestará suporte se um fabricante exigir testes ou documentação.</p>
<h2>Observe segurança e documentação</h2>
<p>A empresa deve planejar trabalho em altura, proteção elétrica e organização do local. Solicite documentação técnica aplicável, registros do projeto, diagramas e orientações de operação. Esses materiais facilitam manutenção e futuras alterações.</p>
<h2>Pesquise histórico e comunicação</h2>
<p>Analise avaliações com senso crítico, peça referências e observe a qualidade das respostas. Comunicação clara antes da venda é um sinal relevante, mas confirme processos formais de atendimento e canais de suporte.</p>
<h2>Não decida apenas pelo prazo de retorno</h2>
<p>Projeções financeiras dependem de fatores variáveis. Compare cenários, qualidade do escopo e riscos. Uma diferença de preço pode refletir equipamentos, estrutura, proteções ou serviços que não aparecem em uma comparação superficial.</p>
<h2>Conclusão</h2>
<p>A melhor empresa é aquela que entende o local, documenta as premissas e assume responsabilidades claras. Reserve tempo para ler a proposta e transformar dúvidas em respostas por escrito antes de assinar.</p>`,
  },
  {
    title: "Energia solar para empresas: o que considerar no projeto",
    slug: "energia-solar-para-empresas-o-que-considerar",
    subtitle: "Perfil de carga, operação e expansão tornam o projeto empresarial diferente do residencial.",
    summary: "Entenda como horários de consumo, demanda, área, continuidade operacional e planos de expansão influenciam um projeto solar empresarial.",
    category: "empresas",
    image: images.panels,
    daysAgo: 19,
    metaTitle: "Energia solar para empresas: como planejar | Energy",
    metaDescription: "Veja como perfil de carga, demanda, operação, área disponível e expansão influenciam o planejamento solar de uma empresa.",
    content: `<p>Empresas podem apresentar consumo concentrado durante o dia, máquinas com picos de potência e tarifas diferentes das residenciais. Por isso, um projeto empresarial precisa partir de dados operacionais e elétricos detalhados.</p>
<h2>Mapeie o perfil de carga</h2>
<p>Além das faturas, registre horários de funcionamento, turnos, sazonalidade e principais equipamentos. Curvas de carga ou medições podem revelar quanto da geração seria consumido simultaneamente e em quais períodos a rede continuaria mais solicitada.</p>
<h2>Entenda demanda e modalidade tarifária</h2>
<p>Dependendo do enquadramento, a fatura pode incluir demanda contratada, horários tarifários e outras parcelas. A geração solar não afeta todos os componentes da mesma maneira. A análise financeira deve reproduzir a estrutura real da conta, sem aplicar uma redução genérica sobre o total.</p>
<h2>Avalie áreas e estruturas disponíveis</h2>
<p>Galpões oferecem área, mas coberturas antigas podem precisar de reparos ou reforços. Estacionamentos solares e instalações no solo podem ser alternativas. A escolha deve considerar sombras, drenagem, vento, circulação e acesso para manutenção.</p>
<h2>Planeje a execução sem interromper a operação</h2>
<p>Defina horários para intervenções elétricas, isolamento de áreas, movimentação de materiais e trabalho em altura. Atividades críticas podem exigir etapas específicas e comunicação prévia com equipes internas.</p>
<h3>Dados que ajudam o projeto</h3>
<ul><li>Faturas e contratos de fornecimento;</li><li>horários e calendário de operação;</li><li>lista de cargas relevantes;</li><li>plantas e informações estruturais;</li><li>projetos de expansão ou novos equipamentos;</li><li>restrições de acesso e segurança.</li></ul>
<h2>Considere o crescimento do negócio</h2>
<p>Novas linhas de produção, climatização, frota eletrificada ou mudança de turno alteram a demanda. O projeto pode avaliar cenários, mas deve separar crescimento confirmado de hipóteses para evitar capacidade sem uso.</p>
<h2>Defina indicadores e responsabilidades</h2>
<p>Combine como a geração será acompanhada, quem receberá alertas e qual será o procedimento diante de falhas. Relatórios periódicos podem comparar produção, consumo e metas, sempre considerando clima e mudanças operacionais.</p>
<h2>Analise riscos financeiros com cenários</h2>
<p>Tarifas, regras, custo de capital e consumo podem mudar. Uma avaliação prudente apresenta premissas e testa cenários, sem prometer economia fixa. Aspectos contábeis e tributários devem ser avaliados por profissionais responsáveis por essas áreas.</p>
<h2>Conclusão</h2>
<p>Um projeto solar empresarial conecta engenharia e operação. Quanto melhores os dados sobre consumo, estrutura e planos do negócio, mais consistente será a solução proposta.</p>`,
  },
];

const plainWords = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

const operations = [
  ...categories.map(([name, slug, description]) => sql`
    insert into blog_categories (name, slug, description)
    values (${name}, ${slug}, ${description})
    on conflict (slug) do nothing
  `),
  sql`
    insert into blog_authors (display_name, job_title, biography)
    select 'Equipe Energy', 'Especialistas em energia solar',
      'Conteúdos preparados para tornar decisões sobre energia solar mais claras e bem informadas.'
    where not exists (select 1 from blog_authors where display_name = 'Equipe Energy')
  `,
  ...posts.map((post) => {
    const [image, alt, width, height] = post.image;
    const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000);
    return sql`
      insert into blog_posts (
        title, slug, subtitle, summary, content, cover_image_url, cover_image_alt,
        cover_image_width, cover_image_height, status, is_featured, author_id,
        category_id, published_at, reading_time_minutes, meta_title, meta_description
      )
      select ${post.title}, ${post.slug}, ${post.subtitle}, ${post.summary}, ${post.content},
        ${image}, ${alt}, ${width}, ${height}, 'PUBLISHED', ${Boolean(post.featured)},
        (select id from blog_authors where display_name = 'Equipe Energy' order by created_at limit 1),
        (select id from blog_categories where slug = ${post.category} limit 1),
        ${publishedAt}, ${Math.max(1, Math.ceil(plainWords(post.content) / 220))},
        ${post.metaTitle}, ${post.metaDescription}
      on conflict (slug) do nothing
    `;
  }),
];

await sql.transaction(operations);

const slugs = posts.map((post) => post.slug);
const saved = await sql`
  select slug, title, status, published_at, reading_time_minutes
  from blog_posts
  where slug = any(${slugs})
  order by published_at desc
`;

if (saved.length !== posts.length || saved.some((post) => post.status !== "PUBLISHED" || !post.published_at)) {
  throw new Error(`Validação do seed falhou: esperado ${posts.length}, encontrado ${saved.length}.`);
}

console.log(`Seed concluído e validado: ${saved.length} publicações no banco.`);
console.table(saved.map(({ slug, status, reading_time_minutes }) => ({ slug, status, minutos: reading_time_minutes })));
