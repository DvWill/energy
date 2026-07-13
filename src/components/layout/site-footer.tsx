import { Brand } from "@/components/ui/brand";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";
export function SiteFooter() {
  return (
    <footer className="footer">
      <Container className="footer-grid">
        <div>
          <Brand />
          <p>
            Uma apresentação institucional preparada para receber as informações
            comerciais oficiais da Energy.
          </p>
        </div>
        <div>
          <strong>Navegação</strong>
          {c.navigation.map((x) => (
            <a key={x.href} href={x.href}>
              {x.label}
            </a>
          ))}
        </div>
        <div>
          <strong>Contato</strong>
          <span>{c.contact.email}</span>
          <span>{c.contact.location}</span>
        </div>
        <div>
          <strong>Informações</strong>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </div>
      </Container>
      <Container>
        <p className="copyright">
          © {new Date().getFullYear()} Energy. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}
import Link from "next/link";
