"use client";

import Image from "next/image";
import { ArrowUpRight, CheckCircle2, MousePointerClick } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import { openLeadChat } from "@/lib/chat-events";
import { withBasePath } from "@/lib/base-path";

type Equipment = {
  number: string;
  name: string;
  short: string;
  summary: string;
  image: string;
  alt: string;
  tabs: Array<{ label: string; items: string[] }>;
  metrics?: string[];
  note?: string;
};

const equipment: Equipment[] = [
  {
    number: "01",
    name: "Painéis solares",
    short: "Captam a luz do sol e a transformam em energia elétrica.",
    summary: "Os painéis solares, também chamados de módulos fotovoltaicos, captam a luz do sol e a transformam em energia elétrica de corrente contínua. São formados por células fotovoltaicas protegidas por vidro resistente, moldura de alumínio e materiais preparados para suportar chuva, calor e vento.",
    image: "/assets/equipamentos/painel-solar.webp",
    alt: "Painel solar fotovoltaico monocristalino",
    tabs: [
      { label: "Características", items: ["A potência é medida em Wp (watt-pico).", "Os modelos residenciais possuem alta capacidade de geração por painel.", "Os painéis monocristalinos são os mais utilizados atualmente por sua eficiência.", "Funcionam mesmo em dias nublados, mas com produção reduzida.", "Normalmente possuem vida útil superior a 25 anos.", "Precisam ser instalados em local com boa incidência solar e pouca sombra."] },
      { label: "O que avaliar", items: ["Potência.", "Eficiência.", "Garantia.", "Resistência.", "Espaço disponível.", "Reputação do fabricante."] },
    ],
    metrics: ["Vida útil superior a 25 anos", "Alta eficiência", "Tecnologia monocristalina", "Potência medida em Wp"],
  },
  {
    number: "02",
    name: "Inversor solar",
    short: "Converte a energia dos painéis para o padrão utilizado no imóvel.",
    summary: "O inversor recebe a energia em corrente contínua produzida pelos painéis e a converte em corrente alternada, utilizada pelas tomadas e equipamentos elétricos. Ele também controla o funcionamento do sistema, identifica falhas e registra informações sobre a geração.",
    image: "/assets/equipamentos/inversor-solar.webp",
    alt: "Inversor solar string moderno",
    tabs: [
      { label: "Principais funções", items: ["Converter a energia produzida pelos painéis.", "Sincronizar o sistema com a rede elétrica.", "Procurar automaticamente o melhor ponto de geração por meio dos MPPTs.", "Desligar o sistema em caso de falta de energia da rede nos modelos on-grid convencionais.", "Disponibilizar monitoramento pelo aplicativo ou portal do fabricante.", "Proteger o sistema contra algumas falhas elétricas."] },
      { label: "Tipos", items: ["Inversor string: atende um conjunto de painéis conectados em série.", "Inversor híbrido: funciona com painéis, rede elétrica e baterias.", "Inversor off-grid: utilizado em locais sem acesso à rede elétrica."] },
      { label: "O que avaliar", items: ["Potência.", "Quantidade de MPPTs.", "Eficiência.", "Compatibilidade com os painéis.", "Monitoramento.", "Garantia.", "Assistência técnica."] },
    ],
    note: "O inversor tradicional e o microinversor normalmente são soluções alternativas. O projeto geralmente utiliza um ou outro.",
  },
  {
    number: "03",
    name: "Microinversores",
    short: "Permitem que os painéis trabalhem de maneira mais independente.",
    summary: "O microinversor é instalado próximo aos painéis, geralmente embaixo deles. Cada equipamento pode atender um ou mais módulos solares e converte a energia em corrente alternada diretamente no telhado. Diferentemente do inversor string, cada grupo de painéis trabalha de forma mais independente.",
    image: "/assets/equipamentos/microinversor-solar.webp",
    alt: "Microinversor solar com conectores fotovoltaicos",
    tabs: [
      { label: "Vantagens", items: ["Melhor desempenho quando existem sombras em parte do telhado.", "Permite instalar painéis em diferentes posições e inclinações.", "Possibilita o monitoramento individual de cada painel.", "Facilita futuras ampliações do sistema.", "Uma falha em um painel não compromete toda a geração.", "Trabalha com tensão contínua menor no telhado."] },
      { label: "Pontos de atenção", items: ["O investimento inicial pode ser maior.", "Os equipamentos ficam expostos às condições do telhado.", "A manutenção pode exigir acesso ao local onde os painéis estão instalados.", "É necessário verificar a compatibilidade entre microinversor e painel."] },
      { label: "O que avaliar", items: ["Potência de entrada.", "Quantidade de painéis atendidos.", "Eficiência.", "Comunicação Wi-Fi.", "Monitoramento.", "Garantia."] },
    ],
    metrics: ["Monitoramento por painel", "Maior independência", "Melhor resultado em áreas com sombra", "Facilidade de ampliação"],
  },
  {
    number: "04",
    name: "Estrutura de fixação",
    short: "Mantém os módulos presos ao telhado ou ao solo com segurança.",
    summary: "A estrutura de fixação mantém os painéis solares presos ao telhado ou ao solo. Ela precisa suportar o peso dos módulos, chuvas, dilatação térmica e a força dos ventos. Normalmente é produzida com alumínio, aço galvanizado e parafusos de aço inoxidável, materiais resistentes à corrosão.",
    image: "/assets/equipamentos/estrutura-fixacao.webp",
    alt: "Kit de estrutura de fixação para painéis solares",
    tabs: [
      { label: "Componentes", items: ["Trilhos e perfis de alumínio.", "Grampos intermediários e finais.", "Parafusos, porcas e terminais.", "Ganchos, suportes ou prisioneiros.", "Emendas para os trilhos.", "Componentes de aterramento."] },
      { label: "Tipos de instalação", items: ["Telhado de cerâmica.", "Telha metálica.", "Telhado de fibrocimento.", "Laje.", "Estrutura instalada no solo.", "Cobertura de estacionamento, conhecida como carport solar."] },
      { label: "Cuidados", items: ["Utilizar a estrutura correta para cada tipo de telhado.", "Evitar perfurações que provoquem infiltrações.", "Respeitar o espaçamento e a ventilação dos painéis.", "Verificar as condições do telhado antes da instalação.", "Dimensionar a estrutura conforme o peso e a ação dos ventos.", "Realizar o aterramento adequado das partes metálicas."] },
      { label: "O que avaliar", items: ["Tipo e estado do telhado.", "Material da estrutura.", "Resistência à corrosão.", "Sistema de vedação.", "Inclinação.", "Segurança da instalação."] },
    ],
  },
];

export function SolarEquipmentSection() {
  const [selected, setSelected] = useState<number | null>(null);
  const reduced = useAccessibleMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const current = selected === null ? null : equipment[selected];

  const closeDetails = useCallback(() => {
    setSelected(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bounds = gridRef.current?.getBoundingClientRect();
        if (!bounds || (bounds.top >= 0 && bounds.bottom <= window.innerHeight)) return;
        gridRef.current?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "nearest",
        });
      });
    });
  }, [reduced]);

  const selectProduct = (index: number) => {
    if (selected === index) {
      closeDetails();
      return;
    }
    setSelected(index);
  };

  useEffect(() => {
    if (selected === null || !detailRef.current) return;
    const frame = requestAnimationFrame(() => {
      const bounds = detailRef.current?.getBoundingClientRect();
      if (!bounds || (bounds.top >= 0 && bounds.bottom <= window.innerHeight)) return;
      detailRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [reduced, selected]);

  useEffect(() => {
    if (selected === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetails();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeDetails, selected]);

  return (
    <section id="equipamentos" className="section equipment-section" aria-labelledby="equipment-title">
      <Container>
        <header className="equipment-heading">
          <span>TECNOLOGIA QUE GERA ECONOMIA</span>
          <h2 id="equipment-title">Conheça os equipamentos de um sistema solar</h2>
          <p>Cada componente possui uma função essencial para transformar a luz do sol em energia segura, eficiente e econômica.</p>
        </header>

        <motion.div ref={gridRef} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="equipment-grid">
          {equipment.map((product, index) => (
            <EquipmentCard
              product={product}
              index={index}
              selected={selected === index}
              onSelect={selectProduct}
              key={product.number}
            />
          ))}
        </motion.div>

        {selected === null && (
          <div className="equipment-discovery-hint">
            <span><MousePointerClick aria-hidden="true" /> Clique em um equipamento para conhecer todos os detalhes</span>
            <i aria-hidden="true" />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {current && (
            <motion.div
              ref={detailRef}
              className="equipment-detail-panel"
              key={current.number}
              initial={reduced ? false : { opacity: 0, height: 0, y: 18 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={reduced ? undefined : { opacity: 0, height: 0, y: -10 }}
              transition={{ duration: reduced ? 0 : 0.42 }}
            >
              <button
                type="button"
                className="equipment-detail-close"
                aria-label="Fechar detalhes do equipamento"
                onClick={closeDetails}
              >
                Fechar detalhes <span aria-hidden="true">×</span>
              </button>
              <div className="equipment-detail-copy">
                <span>{current.number} / EQUIPAMENTO</span>
                <h3>{current.name}</h3>
                <p>{current.summary}</p>
                <div className="equipment-detail-tags">
                  {(current.metrics ?? current.tabs.flatMap((item) => item.items)).slice(0, 3).map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="equipment-detail-benefits">
                  {current.tabs[0].items.slice(0, 4).map((item) => (
                    <div key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></div>
                  ))}
                </div>
                {current.note && <p className="equipment-detail-note">{current.note}</p>}
                <button type="button" className="button equipment-detail-cta" onClick={openLeadChat}>Solicite seu projeto solar <ArrowUpRight aria-hidden="true" /></button>
              </div>
              <div className="equipment-detail-visual">
                <ProductImage product={current} priority />
                {(current.metrics ?? current.tabs.map((item) => item.label)).slice(0, 2).map((item, index) => (
                  <span className={`equipment-detail-callout equipment-detail-callout-${index + 1}`} key={item}>{item}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}

function ProductImage({ product, priority = false }: { product: Equipment; priority?: boolean }) {
  return <div className="equipment-product"><span className="equipment-orbit" aria-hidden="true" /><Image src={withBasePath(product.image)} alt={product.alt} fill priority={priority} loading={priority ? "eager" : "lazy"} sizes="(max-width: 760px) 88vw, 45vw" /></div>;
}

function EquipmentCard({ product, index, selected, onSelect }: { product: Equipment; index: number; selected: boolean; onSelect: (index: number) => void }) {
  return <button type="button" className="equipment-card" data-selected={selected ? "true" : "false"} aria-pressed={selected} onClick={() => onSelect(index)} aria-label={`Conheça o equipamento ${product.name}`}>
    <span className="equipment-card-number">{product.number}</span>
    {selected && <span className="equipment-card-selected"><i aria-hidden="true" />Selecionado</span>}
    <span className="equipment-card-media"><Image src={withBasePath(product.image)} alt="" fill priority={index === 0} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 760px) 78vw, 25vw" /></span>
    <strong>{product.name}</strong><span className="equipment-card-short">{product.short}</span><span className="equipment-card-link">Conheça o equipamento <ArrowUpRight aria-hidden="true" /></span>
  </button>;
}
