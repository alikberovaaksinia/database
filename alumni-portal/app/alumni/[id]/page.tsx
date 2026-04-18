import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getCountryName } from "../../lib/countries";
import { computeAgeGroup } from "../../lib/age-group";
import InteractiveGradientText from "../../components/InteractiveGradientText";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function AlumniProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { returnTo } = await searchParams;

  const alumni = await prisma.alumni_raw.findUnique({
    where: {
      db_id: Number(id),
    },
  });

  if (!alumni) {
    notFound();
  }

  // Compute age group dynamically so it stays correct every year,
  // falling back to the stored DB value if no graduation year is available.
  const ageGroup =
    computeAgeGroup(alumni.jeme_ending_period) ?? alumni.age_group;

  const backHref = returnTo || "/directory/alumni";

  return (
    <div className="min-h-screen bg-[#E6E6E6] text-[#1A1A1A]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Link
            href={backHref}
            className="rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-medium text-[#A60F1A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A60F1A] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#A60F1A]/12"
          >
            Back to alumni list
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] shadow-[0_24px_60px_rgba(166,15,26,0.25)]">
          <div className="relative bg-[linear-gradient(135deg,#A60F1A_0%,#D65A61_40%,#7A0C14_100%)] px-8 py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-4xl font-semibold backdrop-blur">
                  {getInitials(alumni.full_name)}
                </div>

                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">
                    Alumni Profile
                  </div>

                  <InteractiveGradientText
                    variant="light"
                    className="mt-2 text-5xl font-semibold tracking-tight"
                  >
                    {alumni.full_name || "Unknown alumnus"}
                  </InteractiveGradientText>

                  <p className="mt-3 text-2xl text-white/90">
                    {formatRoleCompany(alumni.current_role, alumni.current_firm)}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="grid gap-6 bg-[#E6E6E6] p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[30px] border border-[#D9D9D9] bg-white p-7">
              <h2 className="text-3xl font-semibold tracking-tight">
                Current Information
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Current Role" value={alumni.current_role} />
                <InfoCard label="Current Company" value={alumni.current_firm} />
                <InfoCard
                  label="Current Country"
                  value={
                    alumni.current_country
                      ? getCountryName(alumni.current_country)
                      : null
                  }
                />
                <InfoCard label="Current Industry" value={alumni.current_industry} />
                <InfoCard label="Age Group" value={ageGroup} />
                <InfoCard label="Past Notable Firms" value={alumni.notable_past_firms} />
              </div>
            </section>

            <section className="rounded-[30px] border border-[#D9D9D9] bg-white p-7">
              <h2 className="text-3xl font-semibold tracking-tight">
                Contact Information
              </h2>

              <div className="mt-6 grid gap-4">
                <InfoCard label="Email" value={alumni.email} />
                <InfoCard label="Phone" value={alumni.phone_number} />

                {alumni.linkedin && (
                  <div className="rounded-[22px] border border-[#D9D9D9] bg-[#E6E6E6] p-5">
                    <div className="text-sm text-[#737373]">LinkedIn</div>
                    <a
                      href={alumni.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center text-base font-semibold text-[#A60F1A]"
                    >
                      Open LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-[#D9D9D9] bg-white p-7 xl:col-span-2">
              <h2 className="text-3xl font-semibold tracking-tight">
                Role in JEME
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:[grid-auto-rows:1fr]">
                <InfoCard label="JEME Role" value={alumni.jeme_role} />
                <InfoCard label="JEME Graduation Date" value={alumni.jeme_ending_period} />

                <StatusCard
                  label="Member of the Board"
                  value={alumni.board}
                  trueLabel="Yes"
                  falseLabel="No"
                />

                <StatusCard
                  label="Head of the Department"
                  value={alumni.head}
                  trueLabel="Yes"
                  falseLabel="No"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-[22px] border border-[#D9D9D9] bg-[#E6E6E6] p-5">
      <div className="text-sm text-[#737373]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">
        {value && value.trim() ? value : "—"}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  trueLabel,
  falseLabel,
}: {
  label: string;
  value: string | null | undefined;
  trueLabel: string;
  falseLabel: string;
}) {
  const normalized = normalizeBoolean(value);

  return (
    <div className="rounded-[22px] border border-[#D9D9D9] bg-[#E6E6E6] p-5">
      <div className="text-sm text-[#737373]">{label}</div>

      <div className="mt-4">
        {normalized === null ? (
          <span className="inline-flex rounded-full bg-[#E6E6E6] px-4 py-2 text-sm font-semibold text-[#737373]">
            Not specified
          </span>
        ) : normalized ? (
          <span className="inline-flex rounded-full bg-[#F4C7C9] px-4 py-2 text-sm font-semibold text-[#A60F1A]">
            {trueLabel}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-[#E6E6E6] px-4 py-2 text-sm font-semibold text-[#5C5A56]">
            {falseLabel}
          </span>
        )}
      </div>
    </div>
  );
}


function normalizeBoolean(value: string | null | undefined): boolean | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "no") return false;

  return null;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "A";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatRoleCompany(
  role: string | null | undefined,
  company: string | null | undefined,
) {
  if (role && company) return `${role} @ ${company}`;
  if (role) return role;
  if (company) return company;
  return "";
}