export interface WordMatch {
  word: string;
  matched: boolean;
  userSpoken?: string;
}

export interface SpeechScoreResult {
  score: number; // 0 - 100
  words: WordMatch[];
  recognizedText: string;
  targetText: string;
  feedback: string;
}

/**
 * Clean text for comparison (remove punctuation, lower-case, normalize whitespace)
 */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare spoken transcript against target text and score word accuracy
 */
export function scorePronunciation(target: string, spoken: string): SpeechScoreResult {
  const targetClean = cleanText(target);
  const spokenClean = cleanText(spoken);

  const targetTokens = targetClean.split(' ').filter(Boolean);
  const spokenTokens = spokenClean.split(' ').filter(Boolean);

  if (targetTokens.length === 0) {
    return {
      score: 100,
      words: [],
      recognizedText: spoken,
      targetText: target,
      feedback: 'Excellent!',
    };
  }

  let matchedCount = 0;
  const spokenUsed = new Array(spokenTokens.length).fill(false);

  const words: WordMatch[] = targetTokens.map((targetWord) => {
    // Look for exact match or close match in spoken tokens
    const idx = spokenTokens.findIndex((sw, i) => !spokenUsed[i] && (sw === targetWord || isCloseMatch(sw, targetWord)));
    if (idx !== -1) {
      spokenUsed[idx] = true;
      matchedCount++;
      return {
        word: targetWord,
        matched: true,
        userSpoken: spokenTokens[idx],
      };
    }
    return {
      word: targetWord,
      matched: false,
    };
  });

  const score = Math.round((matchedCount / targetTokens.length) * 100);

  let feedback = 'Keep practicing!';
  if (score >= 90) {
    feedback = 'Outstanding pronunciation! Clear, natural and accurate.';
  } else if (score >= 75) {
    feedback = 'Very good! A couple of words need more clarity.';
  } else if (score >= 50) {
    feedback = 'Good attempt. Try speaking at a slower, steadier pace.';
  } else {
    feedback = 'Listen to the audio model carefully and try again.';
  }

  return {
    score,
    words,
    recognizedText: spoken,
    targetText: target,
    feedback,
  };
}

function isCloseMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  let diff = 0;
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 2) return false;
  }
  return true;
}

/**
 * Speak text using Web Speech API with word boundary highlighting
 */
export function speakText({
  text,
  rate = 0.9,
  pitch = 1,
  lang = 'en-US',
  onBoundary,
  onEnd,
  onError,
}: {
  text: string;
  rate?: number;
  pitch?: number;
  lang?: string;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Speech synthesis not supported in this browser.'));
    return null;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = lang;

  // Try to find a high quality English voice (Google US English, Samantha, Daniel, Karen, etc.)
  const voices = window.speechSynthesis.getVoices();
  const englishVoice =
    voices.find((v) => (v.name.includes('Natural') || v.name.includes('Google')) && v.lang.startsWith('en')) ||
    voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  if (onBoundary) {
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        onBoundary(event.charIndex, event.charLength || 0);
      }
    };
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
