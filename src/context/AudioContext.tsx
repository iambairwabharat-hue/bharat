import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface AudioContextType {
  isMuted: boolean;
  toggleAudio: () => void;
  playHover: () => void;
  playClick: () => void;
  playTransition: () => void;
  playToggle: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleAudio: () => {},
  playHover: () => {},
  playClick: () => {},
  playTransition: () => {},
  playToggle: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site_audio_muted');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    // Default to unmuted so sound and background music play on interaction
    return false;
  });

  useEffect(() => {
    audioEngine.setMuted(isMuted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('site_audio_muted', String(isMuted));
    }
  }, [isMuted]);

  // Autoplay handler: Resume Web Audio API on first user gesture anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isMuted) {
        audioEngine.getContext();
        audioEngine.setMuted(false);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isMuted]);

  const toggleAudio = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        // Turning audio ON
        audioEngine.getContext();
        audioEngine.setMuted(false);
        audioEngine.playToggle();
      } else {
        // Turning audio OFF
        audioEngine.setMuted(true);
      }
      return next;
    });
  }, []);

  const playHover = useCallback(() => {
    audioEngine.playHover();
  }, []);

  const playClick = useCallback(() => {
    audioEngine.playClick();
  }, []);

  const playTransition = useCallback(() => {
    audioEngine.playTransition();
  }, []);

  const playToggle = useCallback(() => {
    audioEngine.playToggle();
  }, []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleAudio, playHover, playClick, playTransition, playToggle }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
