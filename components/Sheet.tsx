"use client";
import { useEffect } from "react";

export default function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="sheet-head"><span className="grip" /><b>{title}</b><button className="x" onClick={onClose} aria-label="닫기">✕</button></div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}
