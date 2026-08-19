import {
  Check,
  CircleGauge,
  Flag,
  MessagesSquare,
  Minus,
  Scale,
} from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";
import {
  AnimatedIcon,
  EyebrowReveal,
  LineReveal,
  NumberReveal,
  Reveal,
  StaggerGrid,
  StaggerList,
  TextReveal,
} from "@/components/motion/motion-primitives";
import { SolarEquipmentSection } from "@/components/landing/solar-equipment-section";
import { withBasePath } from "@/lib/base-path";
const criteriaIcons = [Flag, MessagesSquare, Scale];
export function Trust() {
  return (
    <section className="trust" aria-label="Informações comerciais a confirmar">
      <Reveal>
        <Container>
          <p>INFORMAÇÕES AGUARDANDO VALIDAÇÃO</p>
          <div>
            {c.trust.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
export function ProblemSolution() {
  return <SolarEquipmentSection />;
}
export function Benefits() {
  return (
    <div
      id="quem-somos"
      className="founders-section"
      role="region"
      aria-labelledby="founders-title"
    >
      <span className="founders-orbit founders-orbit-left" aria-hidden="true" />
      <span className="founders-orbit founders-orbit-right" aria-hidden="true" />
      <Container className="founders-layout founders-layout-group">
        <div className="founder-column founder-column-guilherme">
          <div className="founder-portrait founder-portrait-guilherme">
            <Image
              src={withBasePath("/images/fundadores/guilherme-v2.png")}
              alt="Guilherme, sócio-fundador da Energy Soluções"
              width={1093}
              height={2100}
              sizes="(max-width: 680px) 48vw, 32vw"
              loading="eager"
            />
          </div>
          <div className="founder-caption founder-caption-guilherme">
            <strong>GUILHERME</strong>
            <span>SÓCIO-FUNDADOR</span>
          </div>
        </div>
        <Reveal className="founders-copy">
          <EyebrowReveal>POR TRÁS DA ENERGY</EyebrowReveal>
          <h2 id="founders-title">
            <span>Quem</span> <strong>Somos</strong>
          </h2>
          <p>
            Dois sócios, uma missão: transformar o sol em economia, segurança e
            tranquilidade para nossos clientes.
          </p>
          <span className="founders-copy-line" aria-hidden="true" />
        </Reveal>
        <div className="founder-column founder-column-max">
          <div className="founder-portrait founder-portrait-max">
            <Image
              src={withBasePath("/images/fundadores/max-v2.png")}
              alt="Max, sócio-fundador da Energy Soluções"
              width={983}
              height={2178}
              sizes="(max-width: 680px) 48vw, 32vw"
              loading="eager"
            />
          </div>
          <div className="founder-caption founder-caption-max">
            <strong>MAX</strong>
            <span>SÓCIO-FUNDADOR</span>
          </div>
        </div>
      </Container>
      <svg
        className="founders-wave"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="founders-wave-glow" x="-10%" y="-80%" width="120%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
          </filter>
        </defs>
        <path
          d="M0 24 C230 2 390 78 720 78 C1050 78 1210 2 1440 24 L1440 100 L0 100 Z"
          fill="#0A2B49"
        />
        <path
          d="M0 24 C230 2 390 78 720 78 C1050 78 1210 2 1440 24"
          fill="none"
          stroke="#ff681d"
          strokeWidth="8"
          opacity=".55"
          filter="url(#founders-wave-glow)"
        />
        <path
          d="M0 24 C230 2 390 78 720 78 C1050 78 1210 2 1440 24"
          fill="none"
          stroke="#ff7a2d"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
export function Process() {
  return (
    <section id="processo" className="section dark-section">
      <Container>
        <div className="section-heading motion-heading landing-section-heading">
          <EyebrowReveal>COMO FUNCIONA</EyebrowReveal>
          <TextReveal
            lines={[
              {
                content: (
                  <>
                    Do primeiro contato a uma{" "}
                    <span className="text-keyword-blue">
                      proposta coerente.
                    </span>
                  </>
                ),
              },
            ]}
          />
          <LineReveal />
        </div>
        <StaggerList className="process">
          {c.process.map((x, i) => (
            <div key={x.title}>
              <NumberReveal>{String(i + 1).padStart(2, "0")}</NumberReveal>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </StaggerList>
      </Container>
    </section>
  );
}
export function Differentiators() {
  return (
    <section className="section criteria-section">
      <Container>
        <div className="section-heading motion-heading landing-section-heading criteria-heading">
          <EyebrowReveal>FORMA DE TRABALHAR</EyebrowReveal>
          <TextReveal
            lines={[
              {
                content: (
                  <>
                    Critérios que facilitam uma{" "}
                    <span className="text-keyword-blue">boa decisão.</span>
                  </>
                ),
              },
            ]}
          />
        </div>
        <StaggerGrid className="criteria-grid">
          {c.differentiators.map((item, index) => {
            const Icon = criteriaIcons[index];
            return (
              <article className="criteria-card" key={item.label}>
                <Icon className="criteria-card-icon" aria-hidden="true" />
                <h3>{item.label}</h3>
                <div className="criteria-card-comparisons">
                  <div className="criteria-approach criteria-approach-common">
                    <span className="criteria-approach-icon" aria-hidden="true">
                      <Minus />
                    </span>
                    <div>
                      <span>ABORDAGEM COMUM</span>
                      <p>{item.traditional}</p>
                    </div>
                  </div>
                  <div className="criteria-approach criteria-approach-energy">
                    <span className="criteria-approach-icon" aria-hidden="true">
                      <Check />
                    </span>
                    <div>
                      <span>ABORDAGEM ENERGY</span>
                      <p>{item.energy}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </StaggerGrid>
      </Container>
    </section>
  );
}
export function Evidence() {
  return (
    <section className="section section-soft">
      <Container>
        <Reveal className="evidence">
          <AnimatedIcon className="evidence-icon">
            <CircleGauge aria-hidden="true" />
          </AnimatedIcon>
          <div>
            <EyebrowReveal className="eyebrow dark">
              EVIDÊNCIAS COMERCIAIS
            </EyebrowReveal>
            <TextReveal
              lines={[{ content: "Espaço pronto para dados reais." }]}
            />
            <p>
              Métricas, resultados e depoimentos não foram publicados porque
              ainda não foram fornecidos. Assim que validados, podem ser
              incluídos no arquivo central de conteúdo.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
