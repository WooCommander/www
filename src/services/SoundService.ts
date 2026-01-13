// SoundService.ts - Synthetic Sound Effects using Web Audio API

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      // @ts-ignore - Handle webkit prefix if needed
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  // Play a simple beep
  playTone(freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  playSuccess() {
    // Nice major chord arpeggio
    const ctx = this.getContext();
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.playToneAtTime(freq, now + i * 0.1, 0.3, 'sine');
    });
  }

  playError() {
    // Low dissonant sound
    const ctx = this.getContext();
    const now = ctx.currentTime;
    this.playToneAtTime(150, now, 0.3, 'sawtooth');
    this.playToneAtTime(140, now, 0.3, 'sawtooth');
  }

  playFanfare() {
    // Victory fanfare logic
    const ctx = this.getContext();
    const now = ctx.currentTime;
    // Simple melody
    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.50];
    const timings = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 0.95, 1.2];

    notes.forEach((n, i) => {
      this.playToneAtTime(n, now + (timings[i] ?? 0), 0.2, 'square');
    });
  }

  private playToneAtTime(freq: number, time: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) { }
  }
}

export const soundService = new SoundService();
