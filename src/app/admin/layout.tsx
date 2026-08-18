import "./admin.css";

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-route">{children}</div>;
}
