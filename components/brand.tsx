import Link from "next/link";

export function Eyebrow({
  children,
  align = "left",
  paper = false,
  bracketed = false,
}: {
  children: React.ReactNode;
  align?: "left" | "center";
  paper?: boolean;
  bracketed?: boolean;
}) {
  return (
    <span
      className={`eyebrow ${paper ? "eyebrow-paper" : ""} block`}
      style={{ textAlign: align }}
    >
      {bracketed ? <>&#91;&nbsp;{children}&nbsp;&#93;</> : children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  ink = false,
  bracketed = false,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  ink?: boolean;
  bracketed?: boolean;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={align === "center" ? "mx-auto max-w-[44ch]" : ""}
      style={{ textAlign: align }}
    >
      {eyebrow && (
        <div className="mb-4">
          <Eyebrow align={align} paper={ink} bracketed={bracketed}>
            {eyebrow}
          </Eyebrow>
        </div>
      )}
      <Tag
        className={`font-serif ${ink ? "text-paper-2" : "text-ink-900"}`}
        style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.1 }}
      >
        {title}
      </Tag>
      {lead && (
        <p
          className={`mt-4 font-serif italic ${
            ink ? "text-white/75" : "text-ink-500"
          } ${align === "center" ? "mx-auto" : ""}`}
          style={{ fontSize: "21px", lineHeight: 1.5, maxWidth: "52ch" }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="font-serif text-copper-700"
        style={{ fontSize: "clamp(48px, 6vw, 72px)", lineHeight: 1 }}
      >
        {value}
      </div>
      <div className="mt-2.5 font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-ink-500">
        {label}
      </div>
    </div>
  );
}

export function Rule({
  ornament = "dot",
  className = "",
}: {
  ornament?: "dot" | "mandala";
  className?: string;
}) {
  return (
    <div className={`ie-rule ${className}`}>
      {ornament === "dot" ? (
        <span className="h-[5px] w-[5px] flex-none rounded-full bg-copper-700" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/mandala.png"
          alt=""
          width={22}
          height={22}
          className="flex-none opacity-85"
        />
      )}
    </div>
  );
}

type Offering = {
  eyebrow: string;
  title: string;
  price: string;
  note?: string;
  description: string;
  tone: "copper" | "indigo" | "sand";
  cta?: string;
  href?: string;
};

const toneGradient: Record<Offering["tone"], string> = {
  copper: "linear-gradient(135deg, #F2E3D8 0%, #E0BEA9 60%, #CF9E84 100%)",
  indigo: "linear-gradient(135deg, #E0DEEC 0%, #9B98BE 100%)",
  sand: "linear-gradient(135deg, #EFE7D9 0%, #E4D8C7 60%, #CFC3B2 100%)",
};

export function OfferingCard({ o }: { o: Offering }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-[color:var(--border)] bg-paper-2 shadow-sm transition hover:border-[color:var(--border-strong)] hover:shadow-md">
      {/* In-palette placeholder tile, swap for real photography in public/imagery */}
      <div
        className="relative h-[180px] overflow-hidden"
        style={{ background: toneGradient[o.tone] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 w-[150px] -translate-x-1/2 -translate-y-1/2 opacity-20 mix-blend-multiply transition-transform duration-[700ms] group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-[30px]">
        <Eyebrow>{o.eyebrow}</Eyebrow>
        <h3 className="font-serif text-[30px] leading-[1.1] text-ink-900">
          {o.title}
        </h3>
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-[20px] italic text-copper-800">
            {o.price}
          </span>
          {o.note && (
            <span className="font-sans text-[13px] text-ink-400">{o.note}</span>
          )}
        </div>
        <p className="font-sans text-[15px] leading-[1.65] text-ink-500">
          {o.description}
        </p>
        <div className="mt-auto pt-1.5">
          <Link href={o.href ?? "/book"} className="btn btn-secondary btn-md">
            {o.cta ?? "Book Online"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export type { Offering };
