"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_LINKS } from "../lib/constants";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <Image src="/icon.svg" alt="" width={32} height={32} />
        夜虫指数
      </Link>
      <nav aria-label="主要メニュー">
        {PRIMARY_NAV_LINKS.map((link) => {
          const isCurrent =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
