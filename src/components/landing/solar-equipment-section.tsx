"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useState } from "react";
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
  const [tab, setTab] = useState(0);
  const [start, setStart] = useState(0);
  const reduced = useAccessibleMotion();
  const current = selected === null ? null : equipment[selected];

  const selectProduct = (index: number) => { setSelected(index); setTab(0); };
  const shift = (delta: number) => setStart((value) => (value + delta + equipment.length) % equipment.length);
  const finishDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -55) shift(1);
    if (info.offset.x > 55) shift(-1);
  };
  const visible = Array.from({ length: equipment.length }, (_, i) => (start + i) % equipment.length)
    .filter((index) => index !== selected);

  return (
    <section id="solucao" className="section equipment-section" aria-labelledby="equipment-title">
      <Container>
        <header className="equipment-heading">
          <span>TECNOLOGIA QUE GERA ECONOMIA</span>
          <h2 id="equipment-title">Conheça os equipamentos de um sistema solar</h2>
          <p>Cada componente possui uma função essencial para transformar a luz do sol em energia segura, eficiente e econômica.</p>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div className="equipment-focus" key={current.number} initial={reduced ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -16 }} transition={{ duration: reduced ? 0 : 0.5 }}>
              <div className="equipment-focus-copy">
                <span>{current.number} / EQUIPAMENTO</span>
                <h3>{current.name}</h3>
                <div className="equipment-mobile-product"><ProductImage product={current} priority /></div>
                <p>{current.summary}</p>
                <div className="equipment-tabs" role="tablist" aria-label={`Informações sobre ${current.name}`}>
                  {current.tabs.map((item, index) => <button type="button" role="tab" aria-selected={tab === index} className={tab === index ? "active" : ""} onClick={() => setTab(index)} key={item.label}>{item.label}</button>)}
                </div>
                <div className="equipment-tab-panel" role="tabpanel"><ul>{current.tabs[tab].items.map((item) => <li key={item}>{item}</li>)}</ul></div>
                {current.note && <p className="equipment-note">{current.note}</p>}
                {current.metrics && <div className="equipment-metrics">{current.metrics.map((item) => <span key={item}>{item}</span>)}</div>}
                <button type="button" className="button equipment-cta" onClick={openLeadChat}>Solicite seu projeto solar <ArrowUpRight aria-hidden="true" /></button>
              </div>
              <div className="equipment-desktop-product"><ProductImage product={current} priority /></div>
            </motion.div>
          ) : (
            <motion.div key="all" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="equipment-grid">
              {equipment.map((product, index) => <EquipmentCard product={product} index={index} onSelect={selectProduct} key={product.number} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {current && <button type="button" className="equipment-reset" onClick={() => setSelected(null)}><RotateCcw aria-hidden="true" /> Ver todos os equipamentos</button>}

        <div className={`equipment-carousel ${current ? "is-visible" : ""}`} aria-label="Outros equipamentos" onKeyDown={(event) => { if (event.key === "ArrowLeft") shift(-1); if (event.key === "ArrowRight") shift(1); }} tabIndex={current ? 0 : -1}>
          {current && <>
            <button type="button" className="equipment-arrow prev" aria-label="Equipamentos anteriores" onClick={() => shift(-1)}><ArrowLeft aria-hidden="true" /></button>
            <motion.div className="equipment-carousel-track" drag={reduced ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.08} onDragEnd={finishDrag}>
              {visible.map((index) => <EquipmentCard product={equipment[index]} index={index} onSelect={selectProduct} compact key={equipment[index].number} />)}
            </motion.div>
            <button type="button" className="equipment-arrow next" aria-label="Próximos equipamentos" onClick={() => shift(1)}><ArrowRight aria-hidden="true" /></button>
          </>}
        </div>
        <div className="equipment-dots" aria-hidden="true">{equipment.map((item, index) => <span className={selected === index ? "active" : ""} key={item.number} />)}</div>
      </Container>
    </section>
  );
}

function ProductImage({ product, priority = false }: { product: Equipment; priority?: boolean }) {
  return <div className="equipment-product"><span className="equipment-orbit" aria-hidden="true" /><Image src={withBasePath(product.image)} alt={product.alt} fill priority={priority} loading={priority ? "eager" : "lazy"} sizes="(max-width: 760px) 88vw, 45vw" /></div>;
}

function EquipmentCard({ product, index, onSelect, compact = false }: { product: Equipment; index: number; onSelect: (index: number) => void; compact?: boolean }) {
  return <button type="button" className={`equipment-card ${compact ? "compact" : ""}`} onClick={() => onSelect(index)} aria-label={`Conheça o equipamento ${product.name}`}>
    <span className="equipment-card-number">{product.number}</span>
    <span className="equipment-card-media"><Image src={withBasePath(product.image)} alt="" fill priority={!compact && index === 0} loading={!compact && index === 0 ? "eager" : "lazy"} sizes={compact ? "280px" : "(max-width: 760px) 78vw, 25vw"} /></span>
    <strong>{product.name}</strong><span className="equipment-card-short">{product.short}</span><span className="equipment-card-link">Conheça o equipamento <ArrowUpRight aria-hidden="true" /></span>
  </button>;
}
