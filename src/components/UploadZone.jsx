// Empty-state upload zone with drag-and-drop, file picker, and a "use sample" shortcut.
// Becomes hidden once data is loaded into the dashboard.

import { useRef, useState } from 'react';

export default function UploadZone({ onFile, onLoadSample }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <section>
      <div
        onClick={(e) => {
          if (e.target.tagName !== 'BUTTON') inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={
          'border border-dashed rounded-[14px] py-16 px-8 text-center cursor-pointer transition-all duration-200 ' +
          (dragging
            ? 'border-saffron bg-saffron/[0.08] scale-[1.005]'
            : 'border-line hover:border-saffron hover:bg-saffron/[0.04]')
        }
        style={{ background: 'linear-gradient(180deg, rgba(232,184,78,0.02), transparent)' }}
      >
        <div className="w-14 h-14 rounded-full mx-auto mb-[18px] grid place-items-center"
             style={{ background: 'rgba(232,184,78,0.1)', border: '1px solid rgba(232,184,78,0.3)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px] text-saffron">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h3 className="font-display font-medium text-2xl text-bone mb-2">
          Upload your monthly transactions
        </h3>
        <p className="text-muted text-sm mb-6">
          Drag a .csv file here, or click to browse. We never send your data anywhere — everything runs in your browser.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-4 py-[9px] rounded-full text-[13px] font-semibold bg-saffron text-ink border border-saffron hover:bg-saffron-deep transition-colors"
          >
            Choose CSV file
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample();
            }}
            className="inline-flex items-center gap-2 px-4 py-[9px] rounded-full text-[13px] font-medium bg-ink-2 text-bone-2 border border-line hover:border-saffron hover:text-saffron transition-colors"
          >
            Use sample data
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />

        <div className="mt-8 px-5 py-[18px] bg-ink-2 border border-line-soft rounded-[10px] text-left font-mono text-[11.5px] text-muted overflow-x-auto whitespace-nowrap">
          {[
            { name: 'Date', required: true },
            { name: 'Type', required: true },
            { name: 'Description', required: true },
            { name: 'Category', required: true },
            { name: 'Quantity', required: true },
            { name: 'UnitPrice', required: true },
            { name: 'VATRate', required: true },
            { name: 'Counterparty', required: true },
            { name: 'InvoiceNo', required: true },
            { name: 'VATWithheld', required: false },
            { name: 'VATExempt', required: false },
            { name: 'WHTRate', required: false },
          ].map((col, i, arr) => (
            <span key={col.name}>
              <span className={col.required ? 'text-saffron font-medium' : 'text-muted-2 font-normal'}>
                {col.name}
              </span>
              {i < arr.length - 1 && ','}
            </span>
          ))}
          <span className="ml-3 text-[10.5px] text-muted-2 not-italic">(last 3 optional)</span>
        </div>
      </div>
    </section>
  );
}
