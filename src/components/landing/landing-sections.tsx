import { Fragment } from "react";
import {
  Check,
  CircleGauge,
  ClipboardCheck,
  MessagesSquare,
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
  StaggerRows,
  TextReveal,
} from "@/components/motion/motion-primitives";
import { SolarEquipmentSection } from "@/components/landing/solar-equipment-section";
const icons = [Target, ClipboardCheck, MessagesSquare, Sparkles];
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
            lines={[{ content: "Uma jornada comercial mais clara." }]}
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
              { content: "Do primeiro contato a uma proposta coerente." },
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
    <section className="section">
      <Container>
        <div className="section-heading motion-heading landing-section-heading">
          <EyebrowReveal>FORMA DE TRABALHAR</EyebrowReveal>
          <TextReveal
            lines={[{ content: "Critérios que facilitam uma boa decisão." }]}
          />
          <LineReveal />
        </div>
        <StaggerRows
          label="Comparação de abordagens"
          headers={["Critério", "Abordagem comum", "Abordagem Energy"]}
          rows={c.differentiators.map((item) => ({
            key: item.label,
            cells: [
              item.label,
              item.traditional,
              <Fragment key={`${item.label}-energy`}>
                <Check aria-hidden="true" />
                {item.energy}
              </Fragment>,
            ],
          }))}
        />
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
