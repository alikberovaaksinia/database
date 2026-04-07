export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style href="stats-bg" precedence="high">{`html, body { background-color: #08090B; }`}</style>
      {children}
    </>
  );
}
