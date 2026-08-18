"use client";

import { ExternalLink, FileText, FolderTree, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/admin/blog",
    label: "Publicações",
    icon: FileText,
  },
  {
    href: "/admin/blog/novo",
    label: "Nova publicação",
    icon: PlusCircle,
  },
  {
    href: "/admin/blog/categorias",
    label: "Categorias",
    icon: FolderTree,
  },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="admin-navigation" aria-label="Navegação administrativa">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin/blog"
            ? pathname === href ||
              (pathname.startsWith(`${href}/`) &&
                pathname !== "/admin/blog/novo" &&
                pathname !== "/admin/blog/categorias")
            : pathname.startsWith(href);
        return (
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            key={href}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <Link href="/blog" target="_blank" rel="noopener noreferrer">
        <ExternalLink aria-hidden="true" />
        <span>Ver blog</span>
      </Link>
    </nav>
  );
}
