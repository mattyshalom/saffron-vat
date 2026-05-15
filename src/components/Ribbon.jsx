// Compact metadata strip that sits above the KPIs.
// Acts as a quick provenance summary for the loaded dataset.

const Chip = ({ label, value }) => (
  <span className="bg-ink-2 border border-line-soft px-3 py-1.5 rounded-md text-[11.5px] text-muted font-mono tracking-wider">
    {label} <strong className="text-bone ml-1.5 font-medium">{value}</strong>
  </span>
);

export default function Ribbon({ count, period }) {
  const generated = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex gap-2 flex-wrap mb-5 animate-fadeUp">
      <Chip label="Filed under" value="FIRS · 7.5% Standard Rate" />
      <Chip label="Transactions" value={count} />
      <Chip label="Period" value={period} />
      <Chip label="Generated" value={generated} />
    </div>
  );
}
