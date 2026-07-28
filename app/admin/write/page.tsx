import type { Metadata } from "next";
import { WriteDesk } from "@/components/WriteDesk";

export const metadata: Metadata = {
  title: "Writing Desk",
  robots: { index: false, follow: false },
};

export default function WritePage() {
  return <WriteDesk />;
}
