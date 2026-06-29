import { useCallback, useRef } from 'react';

export const useVoiceFeedback = () => {
  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenTimeRef = useRef<number>(0);

  const speak = useCallback((text: string, isUrgent: boolean = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Read options from local storage (synced with settings deck)
    const settingsStr = localStorage.getItem('kinova_settings');
    let isSpeechEnabled = true;
    let speechRate = 1.0;

    if (settingsStr) {
      try {
        const parsed = JSON.parse(settingsStr);
        if (parsed.enableVoice !== undefined) {
          isSpeechEnabled = parsed.enableVoice;
        }
        if (parsed.voiceSpeed !== undefined) {
          speechRate = parsed.voiceSpeed;
        }
      } catch (e) {
        console.error('Error parsing settings in useVoiceFeedback', e);
      }
    }

    if (!isSpeechEnabled) {
      return;
    }

    const now = performance.now();
    const isDuplicate = text === lastSpokenTextRef.current;
    
    // Throttling for non-urgent feedback cues (posture corrections) to prevent verbal spam
    if (!isUrgent) {
      const throttleDuration = 3500; // 3.5 seconds
      const elapsed = now - lastSpokenTimeRef.current;
      
      // Block if we are within throttle duration, or if it is a duplicate correction cue spoken within 10 seconds
      if (elapsed < throttleDuration || (isDuplicate && elapsed < 8000)) {
        return;
      }
    }

    // If urgent (e.g., rep completed), cancel any ongoing announcements and speak immediately
    if (isUrgent) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Track execution timestamps
    utterance.onstart = () => {
      lastSpokenTextRef.current = text;
      lastSpokenTimeRef.current = performance.now();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancelSpeech };
};
