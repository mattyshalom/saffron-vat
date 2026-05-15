// Editorial hero: large serif headline + accompanying period meta block.
// Sets the tone before the dashboard renders.

export default function Hero({ period }) {
  return (
    <section className="mb-12 grid grid-cols-[1fr_auto] gap-10 items-end max-md:grid-cols-1">
      <div>
        <h1 className="font-display font-light text-[56px] leading-[1.05] tracking-tight text-bone max-md:text-[38px] print-text">
          Tax season, <em className="not-italic font-normal text-saffron print-accent">without the dread.</em>
        </h1>
        <p className="text-muted max-w-[520px] mt-3.5 text-[15px] print-muted">
          Drop in your monthly transactions. Saffron computes Output VAT, Input VAT, and the Net amount payable to FIRS — accounting for withholding agents and mixed rates — and shows you which products are actually carrying the business.
        </p>
      </div>
      <div className="text-right max-md:text-left font-mono text-[11px] text-muted-2 tracking-widest uppercase">
        <span>Reporting Period</span>
        <span className="block font-display text-[18px] font-medium text-bone-2 normal-case tracking-normal mt-1.5 print-text">
          {period || '—'}
        </span>
      </div>
    </section>
  );
}
