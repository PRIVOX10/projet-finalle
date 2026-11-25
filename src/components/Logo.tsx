export function Flame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true" className={`logo-flame ${className ?? ""}`}>
      <path d="M12 1c6 8 11 13.3 11 19a11 11 0 0 1-22 0C1 14.3 6 9 12 1Z" fill="#EFA24F" />
      <path d="M12 13c3 4 5 6.6 5 9.2a5 5 0 0 1-10 0C7 19.6 9 17 12 13Z" fill="#FCEBD6" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-semibold ${className}`}>
      <Flame className="h-[1.05em] w-auto" />
      Kandili
    </span>
  );
}
