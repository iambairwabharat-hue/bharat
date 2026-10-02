import { useAudio } from '../context/AudioContext';

export default function AudioController() {
  const { isMuted, toggleAudio, playHover } = useAudio();

  return (
    <button
      onClick={toggleAudio}
      onMouseEnter={playHover}
      data-cursor="AUDIO"
      title={isMuted ? 'Turn Sound & Ambient Music ON' : 'Turn Sound & Ambient Music OFF'}
      className="fixed top-8 left-8 z-[80] flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/40 text-white/70 hover:text-white transition-all duration-300 group cursor-pointer mix-blend-difference"
    >
      {/* Audio Icon / Visualizer */}
      <div className="w-4 h-4 flex items-center justify-center relative">
        {!isMuted ? (
          /* Playing Sound Equalizer Animation */
          <div className="flex items-end gap-[2px] h-3">
            <span className="w-[2px] bg-white rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_alternate]" />
            <span className="w-[2px] bg-white rounded-full animate-[soundbar_0.6s_ease-in-out_0.2s_infinite_alternate]" />
            <span className="w-[2px] bg-white rounded-full animate-[soundbar_1.0s_ease-in-out_0.4s_infinite_alternate]" />
          </div>
        ) : (
          /* Muted Speaker Icon */
          <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>

      {/* Monospace Text Label */}
      <span className="text-[9px] tracking-[0.3em] font-mono uppercase text-white/60 group-hover:text-white transition-colors">
        {!isMuted ? 'SOUND ON' : 'SOUND OFF'}
      </span>
    </button>
  );
}
