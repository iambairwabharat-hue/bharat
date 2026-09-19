// Web Audio API Synth & Sound Effects Engine

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientTimer: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private chordIndex: number = 0;

  // Rich atmospheric chord progressions (Hz)
  private chords: number[][] = [
    // Cmaj9 (C3, G3, B3, D4, E4)
    [130.81, 196.00, 246.94, 293.66, 329.63],
    // Am9 (A2, E3, G3, C4, B4)
    [110.00, 164.81, 196.00, 261.63, 493.88],
    // Fmaj7 (F2, C3, E3, A3, C4)
    [87.31, 130.81, 164.81, 220.00, 261.63],
    // Gsus4 / G7 (G2, D3, F3, B3, D4)
    [98.00, 146.83, 174.61, 246.94, 293.66],
  ];

  public getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- LUSH AMBIENT BACKGROUND MUSIC ENGINE ---
  public startAmbient() {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isAmbientPlaying = true;
    this.ambientGain = ctx.createGain();
    
    // Master ambient volume (~0.18 for audible, relaxing ambient music)
    this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 2.0);
    this.ambientGain.connect(ctx.destination);

    this.chordIndex = 0;
    this.playNextChord();
  }

  private playNextChord = () => {
    if (!this.isAmbientPlaying || !this.ambientGain || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    // Filter for warm analog synth tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 4.0);
    filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 7.8);

    const chordGain = ctx.createGain();
    // Smooth crossfade envelope (9 seconds duration, triggers next at 7 seconds)
    chordGain.gain.setValueAtTime(0.001, ctx.currentTime);
    chordGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3.0);
    chordGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 8.8);

    filter.connect(chordGain);
    chordGain.connect(this.ambientGain);

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      // Mix sine & triangle for rich ambient texture
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle detuning for analog chorus depth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 12, ctx.currentTime);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 9.0);
      this.activeOscillators.push(osc);
    });

    // Overlapping schedule every 7 seconds for continuous gapless music
    this.ambientTimer = window.setTimeout(this.playNextChord, 7000);
  };

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientTimer !== null) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      } catch {
        // ignore
      }
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  // --- PREMIUM CYBERPUNK UI SOUND EFFECTS ---

  /**
   * Hover Sound: Crisp white-noise micro-click (No water drop sound!)
   */
  public playHover() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Create short buffer of white noise for micro-click
      const bufferSize = ctx.sampleRate * 0.015; // 15 milliseconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Highpass filter for ultra-crisp metallic HUD tick
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(ctx.currentTime);
    } catch {
      // AudioContext interrupted
    }
  }

  /**
   * Click Sound: Tactile mechanical shutter / snap click
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Crisp Snap (noise transient)
      const bufferSize = ctx.sampleRate * 0.02;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Sub-bass tactile punch (140Hz -> 40Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext interrupted
    }
  }

  /**
   * Toggle Sound: Ascending dual tone chime
   */
  public playToggle() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // E5 -> A5 interval
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(880.00, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch {
      // AudioContext interrupted
    }
  }

  public playTransition() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.33);
    } catch {
      // AudioContext interrupted
    }
  }
}

export const audioEngine = new AudioEngine();
