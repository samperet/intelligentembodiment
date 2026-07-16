import { Eyebrow } from "./brand";
import { KaleidoscopeMandala } from "./KaleidoscopeMandala";

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-[clamp(40px,6vw,72px)] pt-[clamp(64px,9vw,110px)] text-center">
      <KaleidoscopeMandala
        petals={8}
        className="pointer-events-none absolute inset-0 h-full w-full select-none opacity-[0.07]"
      />
      <div className="relative mx-auto max-w-[820px]">
        {eyebrow && <Eyebrow align="center">{eyebrow}</Eyebrow>}
        <h1
          className="mt-4 font-serif text-ink-900"
          style={{ fontSize: "clamp(38px,5.6vw,64px)", lineHeight: 1.05 }}
        >
          {title}
        </h1>
        {lead && <p className="lead mx-auto mt-5 max-w-[46ch]">{lead}</p>}
      </div>
    </section>
  );
}
