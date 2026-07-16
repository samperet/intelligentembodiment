"use client";

import { usePathname } from "next/navigation";

// Hide the site footer on specific routes (e.g. the focused /share page).
const HIDE_ON = ["/share"];

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && HIDE_ON.includes(pathname)) return null;
  return <>{children}</>;
}
