'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, Volume2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { speakText, scorePronunciation, SpeechScoreResult } from '@/lib/speech';

interface PronunciationTrainerProps {
  targetText: string;
  contextHint?: string;
  arabicMeaning?: string;
  onSuccess?: () => void;
}

export function PronunciationTrainer({
  targetText,
  contextHint,
  arabicMeaning,
  onSuccess,
}: PronunciationTrainerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [result, setResult] = useState<SpeechScoreResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    setResult(null);
    setSpokenText('');

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setSpokenText(transcript);

        // If final result
        if (event.results[0].isFinal) {
          const evalResult = scorePronunciation(targetText, transcript);
          setResult(evalResult);
          if (evalResult.score >= 80) {
            playSuccessChime();
            onSuccess?.();
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone permission was denied. Please allow microphone access to practice speaking.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak clearly into the microphone.');
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      setErrorMsg(err.message || 'Could not start microphone');
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayModel = (slow = false) => {
    setIsPlayingModel(true);
    speakText({
      text: targetText,
      rate: slow ? 0.75 : 0.95,
      onEnd: () => setIsPlayingModel(false),
      onError: () => setIsPlayingModel(false),
    });
  };

  const playSuccessChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or supported
    }
  };

  const reset = () => {
    setResult(null);
    setSpokenText('');
    setErrorMsg(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
            Pronunciation Practice
          </span>
          {contextHint && <p className="text-xs text-slate-400 mt-0.5">{contextHint}</p>}
        </div>

        {/* Audio Model Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePlayModel(false)}
            disabled={isPlayingModel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Volume2 size={15} className="text-cyan-400" />
            <span>Listen (1.0x)</span>
          </button>
          <button
            type="button"
            onClick={() => handlePlayModel(true)}
            disabled={isPlayingModel}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Listen slowly to hear individual sounds"
          >
            <span>Slow (0.75x)</span>
          </button>
        </div>
      </div>

      {/* Target Phrase Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 mb-4">
        <div className="text-lg font-semibold text-white tracking-wide leading-relaxed">
          {targetText}
        </div>
        {arabicMeaning && (
          <div className="text-sm text-cyan-300/80 mt-2 font-arabic" dir="rtl">
            {arabicMeaning}
          </div>
        )}
      </div>

      {/* Active Recording State */}
      {isRecording && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-red-950/30 border border-red-500/30 text-red-200 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <span className="text-sm font-medium">Listening to your voice... Speak clearly now!</span>
          {spokenText && (
            <span className="text-xs text-slate-300 ml-auto italic truncate max-w-[200px]">
              "{spokenText}"
            </span>
          )}
        </div>
      )}

      {/* Evaluation Results */}
      {result && (
        <div className="mb-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.score >= 80 ? (
                <CheckCircle2 className="text-emerald-400" size={20} />
              ) : (
                <AlertCircle className="text-amber-400" size={20} />
              )}
              <span className="text-sm font-semibold text-white">
                Accuracy Score: {result.score}%
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                result.score >= 90
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : result.score >= 75
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {result.score >= 90 ? 'Excellent' : result.score >= 75 ? 'Good' : 'Needs Practice'}
            </span>
          </div>

          {/* Word Accuracy Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.words.map((item, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition ${
                  item.matched
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}
                title={item.matched ? 'Pronounced correctly' : 'Missed or mispronounced'}
              >
                {item.word}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-300 leading-normal">{result.feedback}</p>

          {result.recognizedText && (
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">We heard: </span>
              <span className="text-slate-300 italic">"{result.recognizedText}"</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 mb-4 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex items-center gap-3">
        {isRecording ? (
          <button
            type="button"
            onClick={stopListening}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition shadow-lg shadow-rose-900/30"
          >
            <MicOff size={18} />
            <span>Finish Speaking</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startListening}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition shadow-lg shadow-cyan-950/40"
          >
            <Mic size={18} />
            <span>{result ? 'Practice Again' : 'Record & Pronounce'}</span>
          </button>
        )}

        {result && (
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-sm"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
export default PronunciationTrainer;
