import Link from "next/link";

export default function SeriesFolder({ href, name, count, latest }: { href: string; name: string; count: number; latest?: string }) {
  return (
    <Link href={href} className="sfolder">
      <span className="ficon">
        <svg viewBox="0 0 140 112" aria-hidden="true">
          <defs>
            <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cbcf6" /><stop offset="1" stopColor="#4f97e6" /></linearGradient>
            <linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b4dcfc" /><stop offset="1" stopColor="#7fc0f7" /></linearGradient>
            <linearGradient id="fd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dcecfb" /></linearGradient>
          </defs>
          <path d="M8 18a10 10 0 0 1 10-10h32c4 0 7 1.6 9.4 4.4L66 20h56a10 10 0 0 1 10 10v66a10 10 0 0 1-10 10H18A10 10 0 0 1 8 96z" fill="url(#fb)" />
          <rect x="8" y="30" width="124" height="74" rx="11" fill="url(#ff)" />
          <path d="M58 48a4 4 0 0 1 4-4h20l14 14v32a4 4 0 0 1-4 4H62a4 4 0 0 1-4-4z" fill="url(#fd)" />
          <path d="M82 44l14 14H86a4 4 0 0 1-4-4z" fill="#c4dcf3" />
        </svg>
        <b>{name}</b>
      </span>
      <span className="muted small">{count}편{latest ? ` · 최근 ${latest.slice(5).replace("-", "/")}` : ""}</span>
    </Link>
  );
}
