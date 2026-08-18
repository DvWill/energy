import {
  Check,
  CircleGauge,
  ClipboardCheck,
  Flag,
  MessagesSquare,
  Minus,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
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
const icons = [Target, ClipboardCheck, MessagesSquare, Sparkles];
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
    <section id="beneficios" className="section section-soft">
      <Container>
        <div className="section-heading motion-heading landing-section-heading">
          <EyebrowReveal>VALOR PARA O CLIENTE</EyebrowReveal>
          <TextReveal
            lines={[
              {
                content: (
                  <>
                    Uma jornada comercial{" "}
                    <span className="text-keyword-blue">mais clara.</span>
                  </>
                ),
              },
            ]}
          />
          <p>
            Benefícios de uma abordagem estruturada — ajuste-os quando a oferta
            oficial estiver definida.
          </p>
          <LineReveal />
        </div>
        <StaggerGrid className="card-grid" interactive spotlight>
          {c.benefits.map((x, i) => {
            const Icon = icons[i];
            return (
              <article className="benefit" key={x.title}>
                <AnimatedIcon>
                  <Icon aria-hidden="true" />
                </AnimatedIcon>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </article>
            );
          })}
        </StaggerGrid>
      </Container>
    </section>
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
