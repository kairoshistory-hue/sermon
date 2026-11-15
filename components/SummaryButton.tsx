"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function SummaryButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setSummary(j.summary);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="summary">
      <button onClick={run} disabled={loading} className="btn">{loading ? "요약 중…" : summary ? "다시 요약" : "✨ 요약 보기"}</button>
      {error && <p className="err">{error}</p>}
      {summary && <div className="summary-box"><ReactMarkdown>{summary}</ReactMarkdown></div>}
    </div>
  );
}
