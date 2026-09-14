// Web Audio API Acoustic Emergency Alarm & Tone Synthesizer
// Zero external audio files required - generates synthetic multi-frequency alert pulses

class AcousticSirenEngine {
  constructor() {
    this.audioCtx = null;
    this.oscillator1 = null;
    this.oscillator2 = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isMuted = localStorage.getItem('floodguard_siren_muted') === 'true';
    this.volume = 0.25;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('floodguard_siren_muted', this.isMuted ? 'true' : 'false');
    if (this.isMuted && this.isPlaying) {
      this.stop();
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  // Tactical alternating dual-tone emergency siren for CRITICAL alerts
  playCriticalAlarm() {
    if (this.isMuted || this.isPlaying) return;

    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Primary tone
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator1.type = 'sawtooth';

      // Modulating frequency (880Hz to 660Hz emergency sweep)
      this.oscillator1.frequency.setValueAtTime(880, now);
      this.oscillator1.frequency.linearRampToValueAtTime(660, now + 0.35);
      this.oscillator1.frequency.linearRampToValueAtTime(880, now + 0.7);

      // Low harmonic sub-carrier
      this.oscillator2 = this.audioCtx.createOscillator();
      this.oscillator2.type = 'sine';
      this.oscillator2.frequency.setValueAtTime(440, now);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, now);
      this.gainNode.gain.exponentialRampToValueAtTime(this.volume, now + 0.05);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      this.oscillator1.connect(this.gainNode);
      this.oscillator2.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator1.start(now);
      this.oscillator2.start(now);
      this.oscillator1.stop(now + 0.9);
      this.oscillator2.stop(now + 0.9);

      this.isPlaying = true;
      this.oscillator1.onended = () => {
        this.isPlaying = false;
      };
    } catch (e) {
      console.warn('[AcousticSiren] Audio playback error:', e);
      this.isPlaying = false;
    }
  }

  // Subtle clean high-tech notification chime
  playChime() {
    if (this.isMuted) return;

    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(this.volume * 0.7, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('[AcousticSiren] Chime error:', e);
    }
  }

  stop() {
    try {
      if (this.oscillator1) {
        this.oscillator1.stop();
        this.oscillator1.disconnect();
      }
      if (this.oscillator2) {
        this.oscillator2.stop();
        this.oscillator2.disconnect();
      }
      this.isPlaying = false;
    } catch (e) {
      this.isPlaying = false;
    }
  }
}

export const sirenEngine = new AcousticSirenEngine();
