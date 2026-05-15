// Quiet sign-off line at the bottom of the dashboard.

export default function Footer() {
  return (
    <footer className="mt-20 pt-8 border-t border-line-soft flex justify-between text-xs text-muted-2 font-mono tracking-wider max-md:flex-col max-md:gap-2">
      <span>Saffron · v1.0 · Built for Nigerian businesses</span>
      <span>All processing happens in your browser. No data leaves this device.</span>
    </footer>
  );
}
