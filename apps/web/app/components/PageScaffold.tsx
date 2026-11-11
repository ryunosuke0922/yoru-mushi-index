import type { ReactNode } from "react";
import { SeasonalNotice, type SeasonalNoticeProps } from "./SeasonalNotice";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageScaffold({
  children,
  forecast,
}: { children: ReactNode } & SeasonalNoticeProps) {
  return (
    <>
      <SeasonalNotice forecast={forecast} />
      <main className="page">
        <div className="shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </main>
    </>
  );
}

export function PageIntro({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="page-intro-heading">
        <h1>{title}</h1>
        {action ? <div className="page-intro-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DocumentPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="document-page">
      <h1>{title}</h1>
      {children}
    </section>
  );
}

export function SectionHeading({ title }: { title: string }) {
  return <h2 className="section-heading">{title}</h2>;
}

export function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
