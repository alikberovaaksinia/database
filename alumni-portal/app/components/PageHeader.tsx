import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[#C21A27]/8 via-white to-white px-6 py-8 md:px-8 md:py-10">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#C21A27]/15 bg-[#C21A27]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#C21A27]">
            JEME Alumni Platform
          </div>

          <h1
            className={`${playfair.className} text-4xl font-semibold leading-tight text-[#1D1D1B] md:text-6xl`}
          >
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#615F59] md:text-lg">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}