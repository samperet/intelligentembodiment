"use client";

import { useState, useEffect, useCallback } from "react";
import {
  services,
  AVAILABLE_WEEKDAYS,
  BOOKING_WINDOW_DAYS,
  site,
  type Service,
} from "@/lib/site";
import { Mandala } from "./Mandala";

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

  // Reset downstream selections when the session type changes.
  function chooseService(s: Service) {
    setService(s);
    setSelectedSlot(null);
    setSlots([]);
    if (selectedDate) void loadSlots(selectedDate, s.id);
  }

  const loadSlots = useCallback(
    async (date: string, serviceId: string) => {
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
    },
    [],
  );

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
      setConfirmation({
        when: data.when,
        service: data.service,
        price: data.price,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-copper-100 bg-white/70 p-10 text-center">
        <div className="mx-auto mb-6 w-fit text-copper-400">
          <Mandala className="h-16 w-16" />
        </div>
        <h2 className="text-3xl">You&apos;re booked</h2>
        <p className="mt-4 text-clay/75">
          Your <strong>{confirmation.service}</strong> is confirmed for{" "}
          <strong>{confirmation.when}</strong>.
        </p>
        <p className="mt-2 text-sm text-clay/60">
          A confirmation with the details is on its way to{" "}
          <strong>{form.email}</strong>. See you at {site.address}.
        </p>
        <a href="/" className="btn-ghost mt-8">
          Return home
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      {/* Step 1 — Session */}
      <StepCard step={1} title="Choose your session" done={!!service}>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const active = service?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => chooseService(s)}
                className={`rounded-xl border p-5 text-left transition ${
                  active
                    ? "border-copper-500 bg-copper-50 ring-1 ring-copper-300"
                    : "border-copper-100 bg-white/50 hover:border-copper-300"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-xl text-clay">
                    {s.durationMinutes} min
                  </span>
                  <span className="font-serif text-xl text-copper-600">
                    ${s.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-clay/70">{s.blurb}</p>
              </button>
            );
          })}
        </div>
      </StepCard>

      {/* Step 2 — Date & time */}
      {service && (
        <StepCard step={2} title="Pick a date & time" done={!!selectedSlot}>
          <div className="grid gap-8 md:grid-cols-[auto_1fr]">
            <MonthCalendar
              selected={selectedDate}
              onSelect={chooseDate}
            />
            <div>
              <p className="mb-3 text-sm font-medium text-clay/70">
                {selectedDate
                  ? "Available times"
                  : "Select a date to see available times"}
              </p>
              {slotsLoading && (
                <p className="text-sm text-clay/60">Loading times…</p>
              )}
              {!slotsLoading && selectedDate && slots.length === 0 && (
                <p className="text-sm text-clay/60">
                  No openings this day. Please try another date, or{" "}
                  <a href={site.phoneHref} className="text-copper-600 underline">
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
                      className={`rounded-lg border px-2 py-2.5 text-sm transition ${
                        active
                          ? "border-copper-500 bg-copper-500 text-white"
                          : "border-copper-200 bg-white/60 text-clay hover:border-copper-400"
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

      {/* Step 3 — Details */}
      {service && selectedSlot && (
        <StepCard step={3} title="Your details" done={false}>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Name"
                required
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
            </div>
            <Field
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm text-clay/70">
                Anything you&apos;d like me to know (optional)
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-copper-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-copper-400 focus:ring-1 focus:ring-copper-300"
              />
            </label>

            <div className="mt-2 rounded-lg bg-sand-100 p-4 text-sm text-clay/75">
              <strong className="text-clay">{service.name}</strong> · $
              {service.price} · {selectedSlot.label},{" "}
              {new Date(selectedSlot.start).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            {error && (
              <p className="rounded-lg bg-copper-50 px-4 py-3 text-sm text-copper-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-1 w-full sm:w-auto sm:self-start"
            >
              {submitting ? "Confirming…" : "Confirm booking"}
            </button>
          </form>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({
  step,
  title,
  done,
  children,
}: {
  step: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-copper-100 bg-white/40 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
            done
              ? "bg-copper-500 text-white"
              : "bg-copper-100 text-copper-700"
          }`}
        >
          {done ? "✓" : step}
        </span>
        <h2 className="text-xl">{title}</h2>
      </div>
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
      <span className="mb-1.5 block text-sm text-clay/70">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-copper-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-copper-400 focus:ring-1 focus:ring-copper-300"
      />
    </label>
  );
}

function MonthCalendar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const today = startOfToday();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);

  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(view.year, view.month, d));

  function isSelectable(d: Date): boolean {
    if (d < today || d > maxDate) return false;
    return AVAILABLE_WEEKDAYS.includes(d.getDay());
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
          className="rounded-md px-2 py-1 text-copper-600 transition hover:bg-copper-50 disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-serif text-lg text-clay">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          className="rounded-md px-2 py-1 text-copper-600 transition hover:bg-copper-50 disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1 text-xs font-medium text-clay/40">
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
              className={`aspect-square rounded-lg text-sm transition ${
                isSelected
                  ? "bg-copper-500 text-white"
                  : selectable
                    ? "text-clay hover:bg-copper-100"
                    : "cursor-default text-clay/25"
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
