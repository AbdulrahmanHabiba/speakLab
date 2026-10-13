"use client";

import { useMemo, useState } from 'react';
import { useApp } from '@/components/providers';
import { Header } from '@/components/common';
import { vocabLadder, contractions } from '@/lib/seed';
import { AudioButton } from '@/components/audio/AudioButton';
import { Volume2 } from 'lucide-react';

export default function Vocabulary() {
  const { store } = useApp();
  const [q, setQ] = useState('');
  const [flipped, setFlipped] = useState(-1);

  const words = useMemo(
    () =>
      store.sessions
        .flatMap((s) => s.vocabulary.map((w) => ({ ...w, from: s.title })))
        .filter((w) =>
          (w.word + ' ' + w.arabic + ' ' + w.example).toLowerCase().includes(q.toLowerCase())
        ),
    [store.sessions, q]
  );

  return (
    <>
      <Header
        eyebrow="STUDY LIBRARY"
        title="Vocabulary Bank"
        desc="Your words collected across sessions. Study meaning, listen to audio models, and practice pronunciation."
      />
      <input
        aria-label="Search vocabulary"
        className="field mb-7"
        placeholder="Search words or Arabic meanings..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {words.map((w, i) => (
          <div
            key={i}
            onClick={() => setFlipped(flipped === i ? -1 : i)}
            className="card text-left min-h-36 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="eyebrow">{w.from}</span>
                <AudioButton text={w.word} size="sm" showSlowToggle />
              </div>
              <h3 className="font-bold text-2xl my-2 neon">{w.word}</h3>
              {flipped === i ? (
                <>
                  <p className="text-lg ar font-arabic mt-2" dir="rtl">{w.arabic}</p>
                  <div className="flex items-start justify-between gap-2 mt-3 pt-2 border-t border-slate-800">
                    <p className="muted text-sm">{w.example}</p>
                    <AudioButton text={w.example} size="sm" />
                  </div>
                </>
              ) : (
                <p className="muted text-sm mt-3">Tap to reveal meaning & example ↗</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-3">A1 → C1 Expression Ladder</h2>
      <p className="muted mb-4">
        Approximate complexity only. Words differ in intensity and register; they aren’t exact synonyms.
      </p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'المعنى بالعربي', 'Audio'].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vocabLadder.map((r, i) => (
              <tr key={i}>
                {r.map((x, j) => (
                  <td key={j} className={j === 5 ? 'ar font-arabic' : ''}>
                    {x}
                  </td>
                ))}
                <td>
                  <AudioButton text={r[2]} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-3">Contractions from Day 01</h2>
      <p className="muted mb-4">
        Only expressions appearing in the session or its corrections—not a generic internet list.
      </p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Full</th>
              <th>Short</th>
              <th>Arabic</th>
              <th>Example</th>
              <th>Listen</th>
            </tr>
          </thead>
          <tbody>
            {contractions.map((r, i) => (
              <tr key={i}>
                <td>{r[0]}</td>
                <td className="font-semibold text-cyan-300">{r[1]}</td>
                <td className="ar font-arabic" dir="rtl">{r[2]}</td>
                <td>{r[3]}</td>
                <td>
                  <AudioButton text={r[3]} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}