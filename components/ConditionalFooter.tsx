"use client";

import { usePathname } from "next/navigation";

// Hide site chrome (nav/footer) on focused routes like /share or the
// distraction-free writing desk.
export function ConditionalFooter({
  children,
  hideOn = ["/share"],
}: {
  children: React.ReactNode;
  hideOn?: string[];
}) {
  const pathname = usePathname();
  if (pathname && hideOn.includes(pathname)) return null;
  return <>{children}</>;
}
