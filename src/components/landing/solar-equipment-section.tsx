"use client";

import Image from "next/image";
import { ArrowUpRight, CheckCircle2, MousePointerClick, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const shouldRestoreFocusRef = useRef(true);
  const current = selected === null ? null : equipment[selected];

  const closeDetails = useCallback((restoreFocus = true) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setSelected(null);
  }, []);

  const selectProduct = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    shouldRestoreFocusRef.current = true;
    setSelected(index);
  };

  useEffect(() => {
    if (selected === null) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousModalOpen = body.getAttribute("data-equipment-modal-open");
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.setAttribute("data-equipment-modal-open", "true");
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeDetails();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeys, true);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDialogKeys, true);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      if (previousModalOpen === null) {
        body.removeAttribute("data-equipment-modal-open");
      } else {
        body.setAttribute("data-equipment-modal-open", previousModalOpen);
      }
    };
  }, [closeDetails, selected]);

  const restoreTriggerFocus = useCallback(() => {
    if (shouldRestoreFocusRef.current) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    shouldRestoreFocusRef.current = true;
  }, []);

  const requestProject = () => {
    closeDetails(false);
    requestAnimationFrame(openLeadChat);
  };

  return (
    <section id="equipamentos" className="section equipment-section" aria-labelledby="equipment-title">
      <Container>
        <header className="equipment-heading">
          <span>TECNOLOGIA QUE GERA ECONOMIA</span>
          <h2 id="equipment-title">
            Conheça os equipamentos de um{" "}
            <span className="text-keyword-blue">sistema solar</span>
          </h2>
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

      </Container>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence initial={false} onExitComplete={restoreTriggerFocus}>
          {current && (
            <motion.div
              className="equipment-modal-backdrop"
              key="equipment-modal"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeDetails();
              }}
            >
              <motion.div
                ref={dialogRef}
                id={`equipment-dialog-${current.number}`}
                className="equipment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`equipment-dialog-title-${current.number}`}
                aria-describedby={`equipment-dialog-summary-${current.number}`}
                tabIndex={-1}
                initial={reduced ? false : { opacity: 0, scale: 0.97, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 14 }}
                transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="equipment-modal-close"
                  aria-label={`Fechar detalhes de ${current.name}`}
                  onClick={() => closeDetails()}
                >
                  <span>Fechar</span>
                  <X aria-hidden="true" />
                </button>

                <div className="equipment-modal-layout">
                  <div className="equipment-modal-visual">
                    <ProductImage product={current} priority />
                    <span className="equipment-modal-visual-number" aria-hidden="true">{current.number}</span>
                  </div>

                  <div className="equipment-modal-content">
                    <span className="equipment-modal-eyebrow">{current.number} / EQUIPAMENTO</span>
                    <h3 id={`equipment-dialog-title-${current.number}`}>{current.name}</h3>
                    <p id={`equipment-dialog-summary-${current.number}`} className="equipment-modal-summary">{current.summary}</p>

                    {current.metrics && (
                      <div className="equipment-modal-tags" aria-label="Destaques do equipamento">
                        {current.metrics.map((metric) => <span key={metric}>{metric}</span>)}
                      </div>
                    )}

                    <div className="equipment-modal-sections">
                      {current.tabs.map((tab) => (
                        <section key={tab.label} className="equipment-modal-section">
                          <h4>{tab.label}</h4>
                          <ul>
                            {tab.items.map((item) => (
                              <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>

                    {current.note && <p className="equipment-modal-note">{current.note}</p>}

                    <div className="equipment-modal-footer">
                      <button type="button" className="button equipment-modal-cta" onClick={requestProject}>
                        Solicite seu projeto solar <ArrowUpRight aria-hidden="true" />
                      </button>
                      <span>Projeto dimensionado para a sua necessidade.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

function ProductImage({ product, priority = false }: { product: Equipment; priority?: boolean }) {
  return <div className="equipment-product"><span className="equipment-orbit" aria-hidden="true" /><Image src={withBasePath(product.image)} alt={product.alt} fill priority={priority} loading={priority ? "eager" : "lazy"} sizes="(max-width: 760px) 88vw, 45vw" /></div>;
}

function EquipmentCard({ product, index, selected, onSelect }: { product: Equipment; index: number; selected: boolean; onSelect: (index: number, trigger: HTMLButtonElement) => void }) {
  return <button type="button" className="equipment-card" data-selected={selected ? "true" : "false"} aria-haspopup="dialog" aria-expanded={selected} aria-controls={selected ? `equipment-dialog-${product.number}` : undefined} onClick={(event) => onSelect(index, event.currentTarget)} aria-label={`Conheça o equipamento ${product.name}`}>
    <span className="equipment-card-number">{product.number}</span>
    {selected && <span className="equipment-card-selected"><i aria-hidden="true" />Selecionado</span>}
    <span className="equipment-card-media"><Image src={withBasePath(product.image)} alt="" fill priority={index === 0} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 760px) 78vw, 25vw" /></span>
    <strong>{product.name}</strong><span className="equipment-card-short">{product.short}</span><span className="equipment-card-link">Conheça o equipamento <ArrowUpRight aria-hidden="true" /></span>
  </button>;
}
