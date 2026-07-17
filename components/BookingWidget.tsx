"use client";

import { useState, useCallback, useEffect } from "react";
import {
  services,
  isServiceBookable,
  AVAILABLE_WEEKDAYS,
  BOOKING_WINDOW_DAYS,
  site,
  type Service,
} from "@/lib/site";
import { WhatToExpect } from "./WhatToExpect";

type Slot = { start: string; end: string; label: string };

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function BookingWidget({ initialService }: { initialService?: string }) {
  const [service, setService] = useState<Service | null>(
    services.find((s) => s.id === initialService) ?? null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<null | {
    when: string;
    service: string;
    price: number;
  }>(null);

  // Which days are selectable / how far ahead — mirrors the server settings
  // (admin-editable). Starts from the code defaults, then refines on load.
  const [weekdays, setWeekdays] = useState<number[]>(AVAILABLE_WEEKDAYS);
  const [windowDays, setWindowDays] = useState<number>(BOOKING_WINDOW_DAYS);
  // Which categories accept new bookings. null = still loading.
  const [accept, setAccept] = useState<{
    massage: boolean;
    phone: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking-settings")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.settings) return;
        if (Array.isArray(d.settings.weekdays)) setWeekdays(d.settings.weekdays);
        if (typeof d.settings.bookingWindowDays === "number")
          setWindowDays(d.settings.bookingWindowDays);
        const next = {
          massage: d.settings.acceptingMassage !== false,
          phone: d.settings.acceptingPhone !== false,
        };
        setAccept(next);
        // If a preselected service's category is now closed, drop it.
        setService((cur) =>
          cur && !isServiceBookable(cur, {
            acceptingMassage: next.massage,
            acceptingPhone: next.phone,
          })
            ? null
            : cur,
        );
      })
      .catch(() => {
        if (!cancelled) setAccept({ massage: true, phone: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bookableServices = services.filter((s) =>
    accept
      ? isServiceBookable(s, {
          acceptingMassage: accept.massage,
          acceptingPhone: accept.phone,
        })
      : true,
  );

  const loadSlots = useCallback(async (date: string, serviceId: string) => {
    setSlotsLoading(true);
    setError(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/availability?date=${date}&service=${serviceId}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load times.");
      setSlots(data.slots ?? []);
    } catch (e: any) {
      setError(e.message);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  function chooseService(s: Service) {
    setService(s);
    setSelectedSlot(null);
    setSlots([]);
    if (selectedDate) void loadSlots(selectedDate, s.id);
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    if (service) void loadSlots(date, service.id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          start: selectedSlot.start,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setConfirmation({ when: data.when, service: data.service, price: data.price });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-[color:var(--border)] bg-paper-2 p-10 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-bg text-sage">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 font-serif text-[32px] text-ink-900">You&apos;re booked</h2>
        <p className="mt-3 font-sans text-[17px] leading-[1.65] text-ink-500">
          Your <strong>{confirmation.service}</strong> is confirmed for{" "}
          <strong>{confirmation.when}</strong>.
        </p>
        <p className="mt-2 font-sans text-[16px] text-ink-400">
          A confirmation is on its way to <strong>{form.email}</strong>. See you
          at {site.address}.
        </p>
        <a href="/" className="btn btn-secondary btn-md mt-8">
          Return home
        </a>
      </div>
    );
  }

  if (accept && bookableServices.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-[color:var(--border)] bg-paper-2 p-10 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mandala.png"
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="mx-auto mb-5 opacity-70"
        />
        <h2 className="font-serif text-[28px] text-ink-900">
          Not currently booking
        </h2>
        <p className="mx-auto mt-3 max-w-[40ch] font-sans text-[17px] leading-[1.7] text-ink-500">
          Mackensie isn&apos;t accepting new appointments online right now.
          Please call or text to be added to the list, and you&apos;ll hear as
          soon as sessions reopen.
        </p>
        <a href={site.phoneHref} className="btn btn-secondary btn-md mt-7">
          {site.phone}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      {/* Step 1, Session */}
      <StepCard showHeader={false}>
        {accept && !accept.massage && accept.phone && (
          <p className="mx-auto mb-5 max-w-[520px] rounded-lg bg-sand px-5 py-3.5 text-center font-sans text-[15px] leading-[1.6] text-ink-600">
            Massages are not currently being scheduled. If you&apos;d like to be
            informed when they return,{" "}
            <a href="/about#newsletter" className="text-copper-800 underline">
              sign up for the newsletter
            </a>
. Initial consults are available below.
          </p>
        )}
        <div className="mx-auto grid max-w-[520px] gap-3.5">
          {bookableServices.map((s) => {
            const active = service?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => chooseService(s)}
                className={`flex items-baseline justify-between gap-4 rounded-full border px-7 py-4 text-left shadow-sm transition ${
                  active
                    ? "border-copper-900 bg-copper-800 shadow-md ring-2 ring-copper-300"
                    : "border-copper-700 bg-copper-700 hover:bg-copper-800"
                }`}
              >
                <span className="font-serif text-[22px] text-white">
                  {s.name}
                </span>
                <span className="font-serif text-[22px] italic text-copper-100">
                  ${s.price}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <WhatToExpect />
        </div>
      </StepCard>

      {/* Step 2, Date & time */}
      {service && (
        <StepCard title="Pick a date & time">
          <div className="grid gap-8 md:grid-cols-[auto_1fr]">
            <MonthCalendar
              selected={selectedDate}
              onSelect={chooseDate}
              weekdays={weekdays}
              windowDays={windowDays}
            />
            <div>
              <p className="mb-3 font-sans text-[15px] font-medium uppercase tracking-[0.16em] text-ink-500">
                {selectedDate ? "Available times" : "Select a date"}
              </p>
              {slotsLoading && (
                <p className="font-sans text-[16px] text-ink-400">Loading times…</p>
              )}
              {!slotsLoading && selectedDate && slots.length === 0 && (
                <p className="font-sans text-[16px] text-ink-400">
                  No openings this day. Try another date, or{" "}
                  <a href={site.phoneHref} className="underline">
                    call to arrange
                  </a>
                  .
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const active = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full border px-2 py-2.5 font-sans text-[15px] transition ${
                        active
                          ? "border-copper-800 bg-copper-700 text-white shadow-sm"
                          : "border-copper-300 bg-copper-50 text-ink-700 hover:border-copper-700 hover:bg-copper-100"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </StepCard>
      )}

      {/* Step 3, Details */}
      {service && selectedSlot && (
        <StepCard title="Your details">
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            </div>
            <Field label="Phone (optional)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <label className="block">
              <span className="field-label">What brings you in? (optional)</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="field-input"
              />
            </label>

            <div className="mt-2 rounded-lg border border-copper-200 bg-paper-2 p-4 font-sans text-[16px] text-ink-700">
              <strong className="text-ink-900">{service.name}</strong> · $
              {service.price} · {selectedSlot.label},{" "}
              {new Date(selectedSlot.start).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            {error && (
              <p className="rounded-lg bg-copper-50 px-4 py-3 font-sans text-[16px] text-copper-900">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-1 w-full sm:w-auto sm:self-start">
              {submitting ? "Confirming…" : "Confirm booking"}
            </button>
          </form>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({
  title,
  children,
  showHeader = true,
}: {
  title?: string;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  return (
    <section>
      {showHeader && title && (
        <div className="mb-6 text-center">
          <h2 className="font-serif text-[26px] text-ink-900">{title}</h2>
          <div className="mx-auto mt-3 flex w-[120px] items-center gap-2.5">
            <span className="h-px flex-1 bg-copper-300" />
            <span className="h-[5px] w-[5px] rotate-45 bg-copper-700" />
            <span className="h-px flex-1 bg-copper-300" />
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </label>
  );
}

function MonthCalendar({
  selected,
  onSelect,
  weekdays,
  windowDays,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  weekdays: number[];
  windowDays: number;
}) {
  const today = startOfToday();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + windowDays);

  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(view.year, view.month, d));

  function isSelectable(d: Date): boolean {
    if (d < today || d > maxDate) return false;
    return weekdays.includes(d.getDay());
  }

  const canPrev =
    new Date(view.year, view.month, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(view.year, view.month, 1) < maxDate;

  function shift(delta: number) {
    const m = view.month + delta;
    setView({
      year: view.year + Math.floor(m / 12),
      month: ((m % 12) + 12) % 12,
    });
  }

  return (
    <div className="w-full min-w-[17rem] max-w-xs">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="rounded-md px-2 py-1 text-copper-800 transition hover:bg-copper-50 disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-serif text-[21px] text-ink-900">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          className="rounded-md px-2 py-1 text-copper-800 transition hover:bg-copper-50 disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1 font-sans text-[12px] font-medium uppercase tracking-[0.1em] text-ink-400">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const key = ymd(d);
          const selectable = isSelectable(d);
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => onSelect(key)}
              className={`aspect-square rounded-md font-sans text-[16px] transition ${
                isSelected
                  ? "bg-copper-700 text-white"
                  : selectable
                    ? "text-ink-700 hover:bg-copper-100"
                    : "cursor-default text-ink-400/40"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
