import Link from "next/link";
import { Reveal } from "@/components/motion/motion-primitives";
import { Container } from "@/components/ui/container";
export default function Terms() {
  return (
    <main className="legal">
      <Reveal>
        <Container>
          <Link href="/">← Voltar</Link>
          <h1>Termos de uso</h1>
          <p>
            Versão provisória — requer revisão jurídica e os dados oficiais da
            Energy.
          </p>
          <p>
            O conteúdo desta página tem finalidade institucional e não constitui
            proposta comercial vinculante. Condições aplicáveis devem constar em
            documento formal emitido pela empresa.
          </p>
        </Container>
      </Reveal>
    </main>
  );
}
