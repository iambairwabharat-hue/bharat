import { useAudio } from '../context/AudioContext';

export default function AudioController() {
  const { isMuted, toggleAudio, playHover } = useAudio();

  return (
    <button
      onClick={toggleAudio}
      onMouseEnter={playHover}
      title={isMuted ? 'Turn Sound & Ambient Music ON' : 'Turn Sound & Ambient Music OFF'}
      className="fixed top-8 left-8 z-[80] flex items-center gap-3 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-orange-500/50 text-white/80 hover:text-white transition-all duration-300 group shadow-lg cursor-pointer"
    >
      {/* Audio Icon / Visualizer */}
      <div className="w-5 h-5 flex items-center justify-center relative">
        {!isMuted ? (
          /* Playing Sound Equalizer Animation */
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2.5px] bg-orange-400 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_alternate]" />
            <span className="w-[2.5px] bg-orange-400 rounded-full animate-[soundbar_0.6s_ease-in-out_0.2s_infinite_alternate]" />
            <span className="w-[2.5px] bg-orange-400 rounded-full animate-[soundbar_1.0s_ease-in-out_0.4s_infinite_alternate]" />
          </div>
        ) : (
          /* Muted Speaker Icon */
          <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>

      {/* Text Label */}
      <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-gray-300 group-hover:text-white transition-colors">
        {!isMuted ? <span className="text-orange-400 font-bold">AUDIO ON</span> : 'AUDIO OFF'}
      </span>
    </button>
  );
}
