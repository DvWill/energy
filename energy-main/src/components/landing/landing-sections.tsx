import Image from "next/image";
import { Fragment } from "react";
import {
  ArrowRight,
  Check,
  CircleGauge,
  ClipboardCheck,
  MessagesSquare,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Brand } from "@/components/ui/brand";
import { siteContent as c } from "@/content/landing-page";
import { LeadForm } from "@/components/forms/lead-form";
import {
  AnimatedIcon,
  EyebrowReveal,
  ImageReveal,
  LineReveal,
  MagneticButton,
  NumberReveal,
  ParallaxImage,
  Reveal,
  StaggerGrid,
  StaggerList,
  StaggerRows,
  TextReveal,
} from "@/components/motion/motion-primitives";
import { withBasePath } from "@/lib/base-path";
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
  return (
    <section id="solucao" className="section">
      <Container>
        <div className="section-heading motion-heading">
          <EyebrowReveal>{c.problem.eyebrow}</EyebrowReveal>
          <TextReveal lines={[{ content: c.problem.title }]} />
          <LineReveal />
        </div>
        <ImageReveal className="problem-solar-visual">
          <ParallaxImage distance={10}>
            <Image
              src={withBasePath("/images/energy-solar-panels-hero.webp")}
              alt="Conjunto de painéis solares fotovoltaicos"
              width={1800}
              height={1800}
              sizes="(max-width: 560px) calc(100vw - 24px), 760px"
            />
          </ParallaxImage>
        </ImageReveal>
        <StaggerGrid className="split" alternate>
          <article>
            <NumberReveal>01</NumberReveal>
            <h3>{c.problem.problemTitle}</h3>
            <p>{c.problem.problemText}</p>
          </article>
          <article className="accent-card">
            <NumberReveal>02</NumberReveal>
            <h3>{c.problem.solutionTitle}</h3>
            <p>{c.problem.solutionText}</p>
          </article>
        </StaggerGrid>
      </Container>
    </section>
  );
}
export function Benefits() {
  return (
    <section id="beneficios" className="section section-soft">
      <Container>
        <div className="section-heading motion-heading">
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
        <div className="section-heading motion-heading">
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
        <div className="section-heading motion-heading">
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
export function FinalCta() {
  return (
    <section className="final-cta">
      <Reveal>
        <Container>
          <AnimatedIcon className="final-cta-logo">
            <Brand compact />
          </AnimatedIcon>
          <div>
            <TextReveal
              lines={[{ content: "Vamos entender o que precisa avançar?" }]}
            />
            <p>
              Compartilhe seu contexto para a Energy avaliar o próximo passo.
            </p>
          </div>
          <MagneticButton className="button" href="#contato">
            {c.cta.primary}
            <ArrowRight aria-hidden="true" />
          </MagneticButton>
        </Container>
      </Reveal>
    </section>
  );
}
export function Contact() {
  return (
    <section id="contato" className="section contact">
      <Container>
        <Reveal>
          <div className="contact-copy">
            <EyebrowReveal className="eyebrow dark">CONTATO</EyebrowReveal>
            <TextReveal lines={[{ content: "Comece pelo contexto." }]} />
            <p>
              Preencha os campos ao lado. Nenhum dado será tratado como lead
              enviado enquanto a integração não estiver configurada.
            </p>
            <div className="contact-point">
              <Route aria-hidden="true" />
              <div>
                <strong>Área de atendimento</strong>
                <span>{c.contact.location}</span>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="form-card">
            <h3>Conte sobre sua necessidade</h3>
            <p>Todos os campos são obrigatórios.</p>
            <LeadForm />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
