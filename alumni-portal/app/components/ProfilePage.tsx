import { Playfair_Display } from "next/font/google";
import { getCountryName } from "../lib/countries";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type Person = {
  full_name: string | null;
  current_role: string | null;
  current_firm: string | null;
  current_country: string | null;
  current_industry: string | null;
  age_group: string | null;
  jeme_role: string | null;
  board: string | null;
  head: string | null;
  email: string | null;
  linkedin: string | null;
};

type Props = {
  person: Person;
  backHref: string;
};

export default function ProfilePage({ person, backHref }: Props) {
  const initials = getInitials(person.full_name);
  const phone = "phone" in person ? ((person as { phone?: string | null }).phone || "-") : "-";

  const chips = [
    person.current_country ? getCountryName(person.current_country) : null,
    person.current_industry || null,
    person.age_group || null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#FCFAFA] text-[#1D1D1B]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <a
          href={backHref}
          className="group mb-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1D1D1B] shadow-[0_10px_24px_rgba(0,0,0,0.06)] ring-1 ring-[#E8DCDD] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C21A27] hover:text-white"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Back to alumni list
        </a>

        <div className="overflow-hidden rounded-[36px] bg-[#C21A27] text-white shadow-[0_24px_60px_rgba(194,26,39,0.22)]">
          <div className="relative px-8 py-10 md:px-12 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/25 bg-white/14 text-4xl font-bold tracking-tight backdrop-blur-sm">
                  {initials}
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
                    Alumni Profile
                  </div>

                  <h1 className={`${playfair.className} text-5xl font-semibold leading-none md:text-6xl`}>
                    {person.full_name || "Unknown Alumni"}
                  </h1>

                  <p className="mt-4 text-2xl font-medium text-white/95">
                    {person.current_role || "-"} {person.current_firm ? `@ ${person.current_firm}` : ""}
                  </p>
                </div>
              </div>

              {chips.length > 0 && (
                <div className="flex flex-wrap gap-3 md:max-w-[40%] md:justify-end">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="Current Information">
              <InfoGrid
                items={[
                  { label: "Current Role", value: person.current_role || "-" },
                  { label: "Current Company", value: person.current_firm || "-" },
                  { label: "Current Country", value: getCountryName(person.current_country) },
                  { label: "Current Industry", value: person.current_industry || "-" },
                  { label: "Age Group", value: person.age_group || "-" },
                ]}
              />
            </SectionCard>

            <SectionCard title="Role in JEME">
              <InfoGrid
                items={[
                  { label: "JEME Role", value: person.jeme_role || "-" },
                  { label: "Member of the Board", value: person.board || "-" },
                  { label: "Head of the Department", value: person.head || "-" },
                ]}
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Contact Information">
              <div className="space-y-4">
                <InfoRow label="Email" value={person.email || "-"} />
                <InfoRow label="Phone" value={phone} />

                {person.linkedin && (
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C21A27] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#790E17]"
                  >
                    Open LinkedIn
                    <span>→</span>
                  </a>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-[#E8DCDD] bg-white p-7 shadow-[0_16px_36px_rgba(0,0,0,0.04)]">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#1D1D1B]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[24px] bg-[#FCFAFA] p-5 ring-1 ring-[#F0E7E8]"
        >
          <div className="text-sm font-medium text-[#7A7474]">{item.label}</div>
          <div className="mt-2 text-[1.15rem] font-semibold text-[#1D1D1B]">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#FCFAFA] p-5 ring-1 ring-[#F0E7E8]">
      <div className="text-sm font-medium text-[#7A7474]">{label}</div>
      <div className="mt-2 text-[1.15rem] font-semibold text-[#1D1D1B]">
        {value}
      </div>
    </div>
  );
}

function getInitials(name: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}