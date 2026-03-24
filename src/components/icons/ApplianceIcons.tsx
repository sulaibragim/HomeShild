import React from 'react';

export function RefrigeratorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="16" y="4" width="32" height="56" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 24H48" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <path d="M24 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 28V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="18" y="6" width="28" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="18" y="26" width="28" height="32" rx="2" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

export function WasherIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 24H52" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <circle cx="32" cy="38" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="32" cy="38" r="6" fill="currentColor" opacity="0.1"/>
      <circle cx="44" cy="18" r="2" fill="currentColor" />
      <circle cx="38" cy="18" r="2" fill="currentColor" />
      <rect x="16" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DryerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 24H52" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <circle cx="32" cy="38" r="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 38 Q32 32 38 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <circle cx="44" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="16" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DishwasherIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20H52" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <rect x="28" y="14" width="8" height="4" rx="1" fill="currentColor" />
      <path d="M20 30H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      <path d="M20 40H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      <rect x="14" y="22" width="36" height="28" rx="2" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

export function MicrowaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="22" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.1"/>
      <rect x="44" y="22" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="47" cy="36" r="1.5" fill="currentColor" />
      <circle cx="47" cy="40" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CooktopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="24" width="48" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="20" cy="32" rx="6" ry="3" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="44" cy="32" rx="6" ry="3" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="32" cy="32" rx="4" ry="2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
    </svg>
  );
}

export function RangeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="14" y="12" width="36" height="44" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M14 24H50" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <circle cx="22" cy="18" r="2" fill="currentColor" />
      <circle cx="32" cy="18" r="2" fill="currentColor" />
      <circle cx="42" cy="18" r="2" fill="currentColor" />
      <rect x="20" y="30" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.1"/>
      <path d="M24 34H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
