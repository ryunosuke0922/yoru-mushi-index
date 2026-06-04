import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageScaffold({ children }: { children: ReactNode }) {
  return (
    <main className="page">
      <div className="shell">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </main>
  );
}

export function PageIntro({
  kicker,
  title,
  action,
  children,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="page-intro-heading">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h1>{title}</h1>
        </div>
        {action ? <div className="page-intro-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DocumentPage({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="document-page">
      <p className="section-kicker">{kicker}</p>
      <h1>{title}</h1>
      {children}
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
    </div>
  );
}

export function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
