
export class SoundManager {
  private ctx: AudioContext | null = null;
  private isSupported: boolean = true;
  
  // Loop State
  private currentLoopSource: AudioScheduledSourceNode | null = null;
  private currentLoopGain: GainNode | null = null;
  private currentLoopFilter: BiquadFilterNode | null = null;
  private currentSourceType: string | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        this.isSupported = false;
        console.warn('Web Audio API not supported in this browser.');
      }
    }
  }

  private getContext(): AudioContext | null {
    if (!this.isSupported || typeof window === 'undefined') return null;
    
    try {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          this.ctx = new AudioContextClass();
        }
        
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(e => console.log("Audio resume pending user interaction"));
        }
        return this.ctx;
    } catch (e) {
        console.error("Failed to initialize AudioContext", e);
        this.isSupported = false;
        return null;
    }
  }

  // Generate 2 seconds of white noise once
  private getNoiseBuffer(): AudioBuffer | null {
    const ctx = this.getContext();
    if (!ctx) return null;
    if (this.noiseBuffer) return this.noiseBuffer;

    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  // --- LOOPING SOUNDS FOR SIMULATION ---

  startLoop(type: 'BIKE' | 'WATER' | 'SUN' | 'KETTLE') {
    const ctx = this.getContext();
    if (!ctx) return;
    
    // If already playing this type, ignore
    if (this.currentLoopSource && this.currentSourceType === type) return;

    // Stop any existing loop first
    this.stopLoop();

    this.currentSourceType = type;
    const t = ctx.currentTime;

    // Create Main Gain for Volume Control
    this.currentLoopGain = ctx.createGain();
    this.currentLoopGain.gain.setValueAtTime(0, t);
    this.currentLoopGain.connect(ctx.destination);

    if (type === 'WATER' || type === 'KETTLE') {
        // Noise Based Sounds
        const buffer = this.getNoiseBuffer();
        if (buffer) {
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            
            const filter = ctx.createBiquadFilter();
            this.currentLoopFilter = filter;

            if (type === 'WATER') {
                // Lowpass for rushing water
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(400, t);
            } else {
                // Highpass for steam hiss
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(1000, t);
            }

            src.connect(filter);
            filter.connect(this.currentLoopGain);
            src.start(t);
            this.currentLoopSource = src;
        }
    } else if (type === 'BIKE') {
        // Oscillator Based (Dynamo Hum / Whirring)
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; // Buzzier than sine
        osc.frequency.setValueAtTime(50, t); // Low rumble start
        
        osc.connect(this.currentLoopGain);
        osc.start(t);
        this.currentLoopSource = osc;
    } else if (type === 'SUN') {
        // Ethereal Sine Hum
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        
        osc.connect(this.currentLoopGain);
        osc.start(t);
        this.currentLoopSource = osc;
    }
  }

  updateLoop(intensity: number) {
    // Intensity 0-100
    if (!this.currentLoopGain || !this.currentLoopSource) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const norm = Math.max(0, Math.min(1, intensity / 100)); // 0.0 to 1.0

    // Volume ramp
    const targetVol = norm * 0.15; // Max volume 15%
    this.currentLoopGain.gain.setTargetAtTime(targetVol, t, 0.1);

    // Pitch/Frequency Modulation
    if (this.currentSourceType === 'WATER') {
        // Water flows faster = higher filter cutoff
        if (this.currentLoopFilter) {
            const freq = 300 + (norm * 1000);
            this.currentLoopFilter.frequency.setTargetAtTime(freq, t, 0.1);
        }
    } else if (this.currentSourceType === 'KETTLE') {
        // Steam hisses higher
        if (this.currentLoopFilter) {
            const freq = 1000 + (norm * 3000); // 1k to 4k
            this.currentLoopFilter.frequency.setTargetAtTime(freq, t, 0.1);
        }
    } else if (this.currentSourceType === 'BIKE') {
        // Dynamo spins faster = higher pitch
        const osc = this.currentLoopSource as OscillatorNode;
        const freq = 60 + (norm * 150); // 60Hz to 210Hz
        osc.frequency.setTargetAtTime(freq, t, 0.1);
    } else if (this.currentSourceType === 'SUN') {
        // Sun hums slightly higher
        const osc = this.currentLoopSource as OscillatorNode;
        const freq = 200 + (norm * 100); 
        osc.frequency.setTargetAtTime(freq, t, 0.1);
    }
  }

  stopLoop() {
    if (this.currentLoopSource) {
        try {
            const ctx = this.getContext();
            if (ctx && this.currentLoopGain) {
                // Fade out to avoid click
                this.currentLoopGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
                
                // Stop actual node slightly later
                const oldSource = this.currentLoopSource;
                setTimeout(() => {
                    try { oldSource.stop(); } catch(e){}
                }, 100);
            } else {
                this.currentLoopSource.stop();
            }
        } catch (e) {
            // ignore if already stopped
        }
    }
    this.currentLoopSource = null;
    this.currentLoopGain = null;
    this.currentLoopFilter = null;
    this.currentSourceType = null;
  }

  // --- ONE SHOT SOUNDS ---

  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {}
  }

  playSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } catch (e) {}
  }

  playRobot() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        const osc1 = ctx.createOscillator();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.linearRampToValueAtTime(2000, now + 0.1);
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.1);
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2000, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(800, now + 0.2);
        osc2.connect(gain);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);
    } catch (e) {}
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        const playNote = (freq: number, startTime: number, duration: number) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        playNote(523.25, now, 0.1);       
        playNote(659.25, now + 0.1, 0.1); 
        playNote(783.99, now + 0.2, 0.1); 
        playNote(1046.50, now + 0.3, 0.4); 
    } catch (e) {}
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
