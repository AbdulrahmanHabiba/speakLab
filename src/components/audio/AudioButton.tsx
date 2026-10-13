'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '@/lib/speech';

interface AudioButtonProps {
  text: string;
  lang?: string;
  className?: string;
  showSlowToggle?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioButton({
  text,
  lang = 'en-US',
  className = '',
  showSlowToggle = false,
  label,
  size = 'md',
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText({
      text,
      lang,
      rate: isSlow ? 0.75 : 0.95,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const toggleSlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSlow(!isSlow);
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handlePlay}
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-all ${
          isPlaying
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20 animate-pulse'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
        } ${size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-2.5 py-1.5 text-sm'}`}
        title={isPlaying ? 'Stop listening' : 'Listen to pronunciation'}
        aria-label={label || 'Listen to pronunciation'}
      >
        {isPlaying ? (
          <VolumeX size={iconSizes[size]} className="text-cyan-400" />
        ) : (
          <Volume2 size={iconSizes[size]} className="text-cyan-400" />
        )}
        {label && <span>{label}</span>}
        {isPlaying && (
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
          </span>
        )}
      </button>

      {showSlowToggle && (
        <button
          type="button"
          onClick={toggleSlow}
          className={`px-1.5 py-1 text-xs rounded border transition-colors ${
            isSlow
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:text-slate-200'
          }`}
          title="Toggle slow pace for clearer pronunciation"
        >
          {isSlow ? '0.75x' : '1.0x'}
        </button>
      )}
    </div>
  );
}
export default AudioButton;
