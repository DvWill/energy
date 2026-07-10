import Link from "next/link";
import { Container } from "@/components/ui/container";
export default function Privacy() {
  return (
    <main className="legal">
      <Container>
        <Link href="/">← Voltar</Link>
        <h1>Política de privacidade</h1>
        <p>
          Versão provisória — requer revisão jurídica e inclusão dos dados do
          controlador.
        </p>
        <h2>Dados enviados</h2>
        <p>
          O formulário solicita nome, empresa, e-mail, WhatsApp e uma descrição
          da necessidade para permitir o contato comercial.
        </p>
        <h2>Tratamento</h2>
        <p>
          Os dados serão encaminhados somente à integração configurada pelo
          responsável pelo site. Antes da publicação, informe base legal,
          retenção, operadores e canal para exercício de direitos.
        </p>
      </Container>
    </main>
  );
}
