"use client";

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/components/providers';
import { Header, Back, Empty } from '@/components/common';
import { grammar } from '@/lib/seed';
import { AudioButton } from '@/components/audio/AudioButton';
import { PronunciationTrainer } from '@/components/audio/PronunciationTrainer';
import { Mic, Volume2 } from 'lucide-react';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { store, mark, markQuiz, note } = useApp();
  const s = store.sessions.find((x) => x.id === id);

  const [step, setStep] = useState(0);
  const [pick, setPick] = useState<Record<string, number>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [activeTrainer, setActiveTrainer] = useState<number | null>(null);

  if (!s) return <Empty message="Lesson not found. Open Content Studio to add it." />;

  const screens = [
    'Overview',
    'Corrections',
    'Vocabulary',
    'Grammar',
    'Challenge',
    'Conversation',
    'Reflection',
  ];

  return (
    <>
      <div className="session-heading-area">
        <Back href={'/sections/' + s.section} />
        <Header
          eyebrow={`${s.date} · SESSION ${s.number}`}
          title={s.title}
          desc={s.summary}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {screens.map((x, i) => (
          <button
            key={x}
            className={'btn ' + (i === step ? 'btn-main' : '')}
            onClick={() => setStep(i)}
          >
            {i + 1}. {x}
          </button>
        ))}
      </div>

      <div className="panel p-5 md:p-10 slide">
        {step === 0 && (
          <>
            <div className="eyebrow mb-3">YOUR REAL STORY</div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-3xl font-black">Start with understanding.</h2>
              <AudioButton text={s.summary} label="Listen to story" size="sm" showSlowToggle />
            </div>
            <p className="text-lg leading-9">{s.summary}</p>
            <div className="grid md:grid-cols-3 gap-3 mt-7">
              {[
                ['Corrections', s.corrections.length],
                ['Useful expressions', s.vocabulary.length],
                ['Challenges', s.quizzes.length],
              ].map(([a, b]) => (
                <div className="card" key={a}>
                  <div className="text-3xl font-black neon">{b}</div>
                  <div className="muted">{a}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="eyebrow mb-4">REAL CORRECTIONS</div>
            <h2 className="text-3xl font-bold mb-5">Your words → Natural English</h2>
            <div className="space-y-5">
              {s.corrections.map((c, i) => (
                <div className="card space-y-3" key={i}>
                  <div className="text-pink-300">✕ {c.said}</div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-emerald-300 text-lg font-bold">✓ {c.better}</div>
                    <div className="flex items-center gap-2">
                      <AudioButton text={c.better} size="sm" showSlowToggle />
                      <button
                        type="button"
                        onClick={() => setActiveTrainer(activeTrainer === i ? null : i)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                          activeTrainer === i
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                        }`}
                      >
                        <Mic size={14} />
                        <span>{activeTrainer === i ? 'Close Practice' : 'Practice Pronunciation'}</span>
                      </button>
                    </div>
                  </div>

                  {activeTrainer === i && (
                    <div className="pt-2">
                      <PronunciationTrainer
                        targetText={c.better}
                        contextHint={c.why}
                      />
                    </div>
                  )}

                  <p className="muted text-sm">💡 {c.why}</p>
                  {c.grammar && <span className="tag">{c.grammar}</span>}
                </div>
              ))}
            </div>
            {!s.corrections.length && <p className="muted">No corrections recorded yet.</p>}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold mb-5">Words from this session</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {s.vocabulary.map((v, i) => (
                <div className="card" key={i}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold neon">{v.word}</h3>
                    <AudioButton text={v.word} size="sm" />
                  </div>
                  <p className="ar text-lg my-2 font-arabic" dir="rtl">{v.arabic}</p>
                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800">
                    <p className="muted text-sm">{v.example}</p>
                    <AudioButton text={v.example} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold mb-5">Grammar before the challenge</h2>
            <p className="muted mb-5">Study the exact tense and structure; not just "past tense".</p>
            {grammar.map((g) => (
              <details className="card mb-3" key={g.id}>
                <summary className="cursor-pointer font-bold">
                  {g.title} · {g.ar}
                </summary>
                <p className="mt-4">{g.use}</p>
                <p className="mt-3 text-cyan-200">{g.form}</p>
                <p className="muted mt-2">Signal words: {g.signals}</p>
                {g.examples.map((e) => (
                  <div key={e} className="flex items-center justify-between gap-2 mt-2">
                    <p>• {e}</p>
                    <AudioButton text={e} size="sm" />
                  </div>
                ))}
                <p className="ar mt-4 text-cyan-200">{g.tip}</p>
              </details>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <div className="eyebrow mb-3">LEARN · TRY · UNDERSTAND</div>
            <h2 className="text-3xl font-bold mb-5">Knowledge Check</h2>
            {s.quizzes.map((q, i) => {
              const chosen = pick[q.id];
              const correct = store.quizCorrect[q.id];
              return (
                <div className="card mb-4" key={q.id}>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg">
                      {i + 1}. {q.prompt}
                    </h3>
                    <div className="flex items-center gap-1">
                      <AudioButton text={q.prompt} size="sm" />
                      <button
                        className="btn !p-2"
                        title="Hint"
                        aria-label="Show hint"
                        onClick={() => setHints((v) => ({ ...v, [q.id]: !v[q.id] }))}
                      >
                        💡
                      </button>
                    </div>
                  </div>
                  {hints[q.id] && <p className="text-amber-300 my-2">Hint: {q.hint}</p>}
                  <div className="grid gap-2 mt-4">
                    {q.options.map((o, j) => (
                      <button
                        key={j}
                        disabled={!!correct}
                        onClick={() => {
                          setPick((p) => ({ ...p, [q.id]: j }));
                          if (j === q.answer) markQuiz(q.id);
                        }}
                        className={
                          'btn !justify-start ' +
                          (correct && j === q.answer
                            ? '!border-emerald-400 !bg-emerald-950'
                            : chosen === j
                            ? '!border-cyan-400'
                            : '')
                        }
                      >
                        {String.fromCharCode(65 + j)}. {o}
                      </button>
                    ))}
                  </div>
                  {chosen !== undefined && (
                    <div
                      className={
                        'mt-4 ' +
                        (correct ? 'text-emerald-300' : 'text-amber-300')
                      }
                    >
                      {correct ? '✓ Correct! ' + q.why : 'Not yet. Use the hint and try again.'}
                    </div>
                  )}
                </div>
              );
            })}
            {!s.quizzes.length && <p className="muted">No questions yet.</p>}
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-3xl font-bold mb-4">Your Conversation</h2>
            <p className="muted mb-6">
              Listen to the coach, answer aloud, then reveal a starter idea.
            </p>
            {s.questions.map((q, i) => (
              <div className="card mb-4" key={i}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="font-bold text-cyan-200">Coach: {q}</p>
                  <AudioButton text={q} label="Listen" size="sm" />
                </div>
                <textarea
                  aria-label={'Answer to question ' + (i + 1)}
                  className="field mb-3"
                  value={store.notes[id + '-q' + i] || ''}
                  onChange={(e) => note(id + '-q' + i, e.target.value)}
                  placeholder="Type your answer or practice speaking aloud..."
                />
                <div className="flex items-center justify-between">
                  <button
                    className="btn"
                    onClick={() => setAnswers((p) => ({ ...p, [q]: !p[q] }))}
                  >
                    💡 {answers[q] ? 'Hide guidance' : 'Show guidance'}
                  </button>
                  {store.notes[id + '-q' + i] && (
                    <AudioButton
                      text={store.notes[id + '-q' + i]}
                      label="Listen to my written answer"
                      size="sm"
                    />
                  )}
                </div>
                {answers[q] && (
                  <p className="text-sm muted mt-3">
                    Use a complete sentence. For a completed trip, try Past Simple: subject + V2.
                    Add where, why and what happened next.
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {step === 6 && (
          <>
            <div className="eyebrow mb-3">END OF SESSION</div>
            <h2 className="text-3xl font-bold mb-4">Reflection & Progress</h2>
            <p className="muted mb-4">
              Write two things you learned and one thing to improve tomorrow.
            </p>
            <textarea
              className="field"
              aria-label="Lesson reflections"
              value={store.notes[id + '-reflection'] || ''}
              onChange={(e) => note(id + '-reflection', e.target.value)}
              placeholder="Today I learned..."
            />
            <div className="mt-6">
              <button className="btn btn-main" onClick={() => mark(id)}>
                {store.completed.includes(id)
                  ? '✓ Completed — click to undo'
                  : 'Mark session complete ✓'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center gap-3 my-5">
        <button
          className="btn"
          disabled={step === 0}
          onClick={() => {
            setStep((x) => Math.max(0, x - 1));
            scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          ← Previous
        </button>
        <span className="muted">
          {step + 1} / {screens.length}
        </span>
        <button
          className="btn btn-main"
          disabled={step === screens.length - 1}
          onClick={() => {
            setStep((x) => Math.min(screens.length - 1, x + 1));
            scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Next →
        </button>
      </div>
    </>
  );
}