import Image from "next/image";
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
  DiagonalDivider,
  MotionLink,
  Reveal,
  StaggerGrid,
  StaggerList,
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
        <Reveal className="section-heading">
          <span>{c.problem.eyebrow}</span>
          <h2>{c.problem.title}</h2>
        </Reveal>
        <Reveal className="problem-solar-visual">
          <Image
            src={withBasePath("/images/energy-solar-panels-hero.webp")}
            alt="Conjunto de painéis solares fotovoltaicos"
            width={1800}
            height={1800}
            sizes="(max-width: 560px) calc(100vw - 24px), 760px"
          />
        </Reveal>
        <StaggerGrid className="split">
          <article>
            <span className="number">01</span>
            <h3>{c.problem.problemTitle}</h3>
            <p>{c.problem.problemText}</p>
          </article>
          <article className="accent-card">
            <span className="number">02</span>
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
        <Reveal className="section-heading">
          <span>VALOR PARA O CLIENTE</span>
          <h2>Uma jornada comercial mais clara.</h2>
          <p>
            Benefícios de uma abordagem estruturada — ajuste-os quando a oferta
            oficial estiver definida.
          </p>
        </Reveal>
        <StaggerGrid className="card-grid" interactive>
          {c.benefits.map((x, i) => {
            const Icon = icons[i];
            return (
              <article className="benefit" key={x.title}>
                <Icon />
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
    <section
      id="processo"
      className="section dark-section motion-divider-section"
    >
      <DiagonalDivider />
      <Container>
        <Reveal className="section-heading">
          <span>COMO FUNCIONA</span>
          <h2>Do primeiro contato a uma proposta coerente.</h2>
        </Reveal>
        <StaggerList className="process">
          {c.process.map((x, i) => (
            <div key={x.title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
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
        <Reveal className="section-heading">
          <span>FORMA DE TRABALHAR</span>
          <h2>Critérios que facilitam uma boa decisão.</h2>
        </Reveal>
        <Reveal>
          <div
            className="comparison"
            role="table"
            aria-label="Comparação de abordagens"
          >
            <div className="compare-row compare-head" role="row">
              <span>Critério</span>
              <span>Abordagem comum</span>
              <span>Abordagem proposta</span>
            </div>
            {c.differentiators.map((x) => (
              <div className="compare-row" role="row" key={x.label}>
                <strong>{x.label}</strong>
                <span>{x.traditional}</span>
                <span>
                  <Check aria-hidden="true" />
                  {x.energy}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
export function Evidence() {
  return (
    <section className="section section-soft">
      <Container>
        <Reveal className="evidence">
          <CircleGauge />
          <div>
            <span className="eyebrow dark">EVIDÊNCIAS COMERCIAIS</span>
            <h2>Espaço pronto para dados reais.</h2>
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
          <Brand compact />
          <div>
            <h2>Vamos entender o que precisa avançar?</h2>
            <p>
              Compartilhe seu contexto para a Energy avaliar o próximo passo.
            </p>
          </div>
          <MotionLink className="button" href="#contato">
            {c.cta.primary}
            <ArrowRight aria-hidden="true" />
          </MotionLink>
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
            <span className="eyebrow dark">CONTATO</span>
            <h2>Comece pelo contexto.</h2>
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
