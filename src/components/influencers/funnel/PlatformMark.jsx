import { Globe } from "lucide-react";

// Logos des plateformes proposées par le funnel de référence.
export default function PlatformMark({ name }) {
  if (name === "instagram") {
    return (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <defs>
          <radialGradient id="funnel-ig" cx="0.28" cy="1.08" r="1.25">
            <stop offset="0" stopColor="#fdf497" />
            <stop offset="0.07" stopColor="#fdf497" />
            <stop offset="0.45" stopColor="#fd5949" />
            <stop offset="0.62" stopColor="#d6249f" />
            <stop offset="0.92" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect width="42" height="42" rx="11" fill="url(#funnel-ig)" />
        <rect x="9.5" y="9.5" width="23" height="23" rx="6.8" stroke="#fff" strokeWidth="2.6" />
        <circle cx="21" cy="21" r="5.6" stroke="#fff" strokeWidth="2.6" />
        <circle cx="27.6" cy="14.4" r="1.6" fill="#fff" />
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <rect width="42" height="42" rx="11" fill="#0a0a0a" />
        <path
          d="M24.6 8h3.1c.3 2.6 1.8 4.4 4.3 4.8v3.1c-1.7 0-3.2-.5-4.5-1.4v6.8c0 5-3.3 8.2-7.9 8.2-3.8 0-7-2.9-7-6.9 0-3.8 3-6.8 6.9-6.8.4 0 .7 0 1.1.1v3.3c-.3-.1-.7-.2-1-.2-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5c2.2 0 3.5-1.6 3.5-4.2V8z"
          fill="#fff"
        />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <rect width="42" height="42" rx="11" fill="#ff0033" />
        <path d="M17.5 14.8l10.4 6.2-10.4 6.2z" fill="#fff" />
      </svg>
    );
  }

  return (
    <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
      <Globe className="h-6 w-6" />
    </span>
  );
}