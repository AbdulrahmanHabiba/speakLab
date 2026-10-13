'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common';
import { PronunciationTrainer } from '@/components/audio/PronunciationTrainer';
import { AudioButton } from '@/components/audio/AudioButton';
import { Mic2, Sparkles, Volume2, ShieldCheck, MessagesSquare, GraduationCap, BriefcaseBusiness, CheckCircle2 } from 'lucide-react';

interface PracticeItem {
  id: string;
  category: string;
  categoryAr: string;
  english: string;
  arabic: string;
  phoneticHint?: string;
}

const samplePhrases: PracticeItem[] = [
  // Daily
  {
    id: 'd1',
    category: 'Daily Conversations',
    categoryAr: 'المحادثات اليومية',
    english: 'Today was a very busy day.',
    arabic: 'كان يوماً حافلاً ومزدحماً للغاية اليوم.',
    phoneticHint: 'Notice: was (wuhz), not is.',
  },
  {
    id: 'd2',
    category: 'Daily Conversations',
    categoryAr: 'المحادثات اليومية',
    english: "I'll tell you about my trip.",
    arabic: 'سأخبرك عن رحلتي.',
    phoneticHint: "Contraction: I'll (Ayl) + tell someone.",
  },
  {
    id: 'd3',
    category: 'Daily Conversations',
    categoryAr: 'المحادثات اليومية',
    english: 'I need some sleep before traveling tomorrow.',
    arabic: 'أحتاج لبعض النوم قبل السفر غداً.',
    phoneticHint: 'Need + noun (some sleep).',
  },

  // HSE & Engineering
  {
    id: 'h1',
    category: 'HSE & Safety',
    categoryAr: 'السلامة والهندسة',
    english: 'There is an unprotected fall hazard near the edge.',
    arabic: 'يوجد خطر سقوط غير محمي بالقرب من الحافة.',
    phoneticHint: 'Pronounce hazard: HAZ-erd.',
  },
  {
    id: 'h2',
    category: 'HSE & Safety',
    categoryAr: 'السلامة والهندسة',
    english: 'Inspect the full-body harness and lanyard before elevated work.',
    arabic: 'افحص حزام الأمان لكامل الجسم وحبل التوصيل قبل العمل على ارتفاع.',
    phoneticHint: 'Lanyard: LAN-yerd.',
  },
  {
    id: 'h3',
    category: 'HSE & Safety',
    categoryAr: 'السلامة والهندسة',
    english: 'A guardrail must withstand at least two hundred pounds of force.',
    arabic: 'يجب أن يتحمل درابزين الحماية قوة لا تقل عن 200 رطل.',
    phoneticHint: 'Withstand: with-STAND.',
  },

  // Teaching
  {
    id: 't1',
    category: 'Teaching',
    categoryAr: 'تعليم الأعاجم',
    english: 'Please recite the first verse slowly and clearly.',
    arabic: 'من فضلك اتلُ الآية الأولى ببطء ووضوح.',
    phoneticHint: 'Recite: ri-SYTE.',
  },
  {
    id: 't2',
    category: 'Teaching',
    categoryAr: 'تعليم الأعاجم',
    english: "Let's revise what we practiced in the previous session.",
    arabic: 'دعنا نراجع ما تدربنا عليه في الجلسة السابقة.',
    phoneticHint: 'Revise: ri-VYZE.',
  },

  // Business
  {
    id: 'b1',
    category: 'Business English',
    categoryAr: 'إنجليزي الأعمال',
    english: "I will follow up with the project manager by tomorrow morning.",
    arabic: 'سأقوم بالمتابعة مع مدير المشروع بحلول صباح الغد.',
    phoneticHint: 'Follow up (verb phrase).',
  },
  {
    id: 'b2',
    category: 'Business English',
    categoryAr: 'إنجليزي الأعمال',
    english: 'Could you please confirm the deadline for this deliverable?',
    arabic: 'هل يمكنك تأكيد الموعد النهائي لهذا العمل المطلوب؟',
    phoneticHint: 'Deliverable: di-LIV-er-uh-buhl.',
  },
];

export default function PracticePage() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeItem, setActiveItem] = useState<PracticeItem>(samplePhrases[0]);
  const [customText, setCustomText] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const categories = ['All', 'Daily Conversations', 'HSE & Safety', 'Teaching', 'Business English'];

  const filtered = selectedCat === 'All'
    ? samplePhrases
    : samplePhrases.filter((p) => p.category === selectedCat);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setActiveItem({
      id: 'custom-' + Date.now(),
      category: 'Custom Practice',
      categoryAr: 'تدريب مخصص',
      english: customText.trim(),
      arabic: 'جملة مخصصة من إدخالك',
    });
  };

  return (
    <div className="reading-layout max-w-5xl mx-auto space-y-8">
      <div>
        <span className="overline">SPEAKLAB AUDIO & SPEECH STUDIO</span>
        <h1 className="page-title flex items-center gap-3">
          <Mic2 className="text-cyan-400" size={32} />
          Speech & Pronunciation Practice
        </h1>
        <p className="dashboard-intro">
          Listen to natural native models, record your own voice, and receive instant word-by-word
          accuracy scoring and feedback.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Volume2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Dual Speed</div>
            <div className="text-xs text-slate-400">1.0x Normal & 0.75x Slow phoneme mode</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Mic2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Instant AI Feedback</div>
            <div className="text-xs text-slate-400">Real-time word recognition & accuracy %</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{completedCount} Mastered</div>
            <div className="text-xs text-slate-400">Phrases with 80%+ accuracy</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Practice Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Pronunciation Trainer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {activeItem.category}
              </span>
              <span className="text-xs text-slate-400 font-arabic" dir="rtl">
                {activeItem.categoryAr}
              </span>
            </div>

            <PronunciationTrainer
              key={activeItem.id + activeItem.english}
              targetText={activeItem.english}
              arabicMeaning={activeItem.arabic}
              contextHint={activeItem.phoneticHint}
              onSuccess={() => setCompletedCount((c) => c + 1)}
            />
          </div>

          {/* Custom Phrase Box */}
          <div className="card">
            <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              Practice Any Custom English Phrase
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Type or paste any sentence from your daily work, interview, or study to practice pronouncing it:
            </p>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. I have ten years of experience in site safety..."
                className="field flex-1 text-sm !py-2"
              />
              <button type="submit" className="primary-action !px-4 !py-2 text-sm whitespace-nowrap">
                Load & Practice
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Library of Curated Phrases */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Select a Practice Phrase</h3>
            <span className="text-xs text-slate-400">{filtered.length} phrases</span>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCat(c)}
                className={`px-2.5 py-1 text-xs rounded-lg transition ${
                  selectedCat === c
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* List of Phrases */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = activeItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {item.english}
                    </p>
                    <AudioButton text={item.english} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-arabic" dir="rtl">
                    {item.arabic}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
