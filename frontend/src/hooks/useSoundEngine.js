/**
 * useSoundEngine Hook — v4
 * FASTER 140 BPM, driving bassline, punchy kick, melodic lead,
 * sub-bass drops, combo-escalating SFX, space ambience.
 */

import { useCallback, useRef, useEffect, useState } from 'react';

export function useSoundEngine() {
  const audioCtxRef = useRef(null);
  const bgmGainRef = useRef(null);
  const sfxGainRef = useRef(null);
  const ambienceNodeRef = useRef(null);
  const bgmIntervalsRef = useRef([]);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const bgmGain = ctx.createGain();
      bgmGain.gain.value = 0.07;
      bgmGain.connect(ctx.destination);
      bgmGainRef.current = bgmGain;

      const sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.14;
      sfxGain.connect(ctx.destination);
      sfxGainRef.current = sfxGain;

      return ctx;
    } catch { return null; }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (bgmGainRef.current) bgmGainRef.current.gain.value = next ? 0 : 0.07;
      if (sfxGainRef.current) sfxGainRef.current.gain.value = next ? 0 : 0.14;
      return next;
    });
  }, []);

  const playNote = useCallback((freq, type, duration, gain = 0.05, delay = 0, dest = null) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isMutedRef.current) return;
    const target = dest || sfxGainRef.current || ctx.destination;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(g);
    g.connect(target);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, []);

  // ─── SFX ─────────────────────────────────────
  const playKeySound = useCallback((streak = 0) => {
    const freq = 600 + Math.min(streak, 12) * 80 + Math.random() * 150;
    playNote(freq, 'sine', 0.05, 0.03);
    if (streak >= 5) playNote(freq * 1.5, 'triangle', 0.04, 0.015, 0.02);
  }, [playNote]);

  const playLaserSound = useCallback((level = 1) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isMutedRef.current) return;
    const dest = sfxGainRef.current || ctx.destination;
    const tier = level <= 2 ? 1 : level <= 4 ? 2 : level <= 6 ? 3 : 4;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tier >= 3 ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(1400 + tier * 400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80 + tier * 40, ctx.currentTime + 0.12 + tier * 0.03);
    g.gain.setValueAtTime(0.07 + tier * 0.02, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18 + tier * 0.04);
    osc.connect(g);
    g.connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25 + tier * 0.05);

    if (tier >= 3) playNote(55, 'sine', 0.2, 0.06, 0.03, dest);
    if (tier >= 4) {
      playNote(2800, 'triangle', 0.08, 0.03, 0, dest);
      playNote(70, 'square', 0.25, 0.04, 0.01, dest);
    }
  }, [playNote]);

  const playCompleteSound = useCallback((streak = 0) => {
    const shift = Math.min(streak, 14) * 2;
    const base = 440 * Math.pow(2, shift / 12);
    [1, 1.25, 1.5, 2].forEach((r, i) => playNote(base * r, 'triangle', 0.12, 0.05, i * 0.04));
    if (streak >= 5) playNote(base * 2.5, 'sine', 0.18, 0.03, 0.18);
    if (streak >= 10) playNote(base * 3, 'sine', 0.15, 0.025, 0.22);
  }, [playNote]);

  const playMissSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || isMutedRef.current) return;
    const dest = sfxGainRef.current || ctx.destination;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(g); g.connect(dest);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.45);

    const bufSize = ctx.sampleRate * 0.15;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-i / (bufSize * 0.12));
    const noise = ctx.createBufferSource();
    const ng = ctx.createGain();
    noise.buffer = buf;
    ng.gain.setValueAtTime(0.06, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    noise.connect(ng); ng.connect(dest); noise.start(ctx.currentTime);

    playNote(50, 'sawtooth', 0.35, 0.05, 0.04, dest);
  }, [playNote]);

  const playLevelUpSound = useCallback(() => {
    const fanfare = [523, 659, 784, 1047, 1319, 1568];
    fanfare.forEach((f, i) => playNote(f, 'triangle', 0.22, 0.06, i * 0.06));
    setTimeout(() => {
      playNote(1047, 'sine', 0.6, 0.04, 0);
      playNote(1319, 'sine', 0.6, 0.035, 0);
      playNote(1568, 'sine', 0.6, 0.03, 0);
    }, 400);
  }, [playNote]);

  const playGameOverSound = useCallback(() => {
    const notes = [523, 493, 440, 392, 349, 330, 262, 196];
    notes.forEach((f, i) => playNote(f, 'sine', 0.45, 0.09 - i * 0.009, i * 0.13));
    playNote(82, 'sawtooth', 2.0, 0.06, 1.1);
  }, [playNote]);

  const bgmLevelRef = useRef(1);
  const nextBeatTimeRef = useRef(0);

  const setBGMLevel = useCallback((level) => {
    bgmLevelRef.current = level;
  }, []);

  // ─── BGM: FAST-PACED ENERGETIC TECHNO ─────
  const startBGM = useCallback(() => {
    const ctx = initAudio();
    if (!ctx || !bgmGainRef.current) return;
    stopBGM();

    const bgmGain = bgmGainRef.current;
    let beat = 0;
    let isPlaying = true;

    const bpm = 240; // MAX SPEED (extreme fast-paced energetic techno)
    const bt = 60 / bpm;

    // Classic fast techno sequence
    const bassPattern =   [36, 0, 36, 36, 48, 0, 48, 0, 43, 0, 43, 43, 31, 0, 31, 0];
    const kickPattern =   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    const hatPattern =    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
    const snarePattern =  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
    const sequenceLead =  [0, 0, 0, 523, 0, 659, 0, 587, 0, 0, 0, 523, 0, 659, 0, 784];

    const playNextBeat = () => {
      if (!audioCtxRef.current || !isPlaying) return;
      const now = Math.max(ctx.currentTime, nextBeatTimeRef.current);
      const step = beat % 16;
      const bar = Math.floor(beat / 16);

      // Clean, punchy bass
      const bassNote = bassPattern[step];
      if (bassNote > 0) {
        const bo = ctx.createOscillator();
        const bf = ctx.createBiquadFilter();
        const bg2 = ctx.createGain();
        
        bo.type = 'sawtooth';
        bo.frequency.value = bassNote;
        
        bf.type = 'lowpass';
        bf.frequency.setValueAtTime(800, now);
        bf.frequency.exponentialRampToValueAtTime(120, now + bt * 0.4);
        bf.Q.value = 6;
        
        bg2.gain.setValueAtTime(0.2, now);
        bg2.gain.exponentialRampToValueAtTime(0.001, now + bt * 0.8);
        
        bo.connect(bf); bf.connect(bg2); bg2.connect(bgmGain);
        bo.start(now); bo.stop(now + bt);
      }

      // Punchy, tight kick
      if (kickPattern[step]) {
        const ko = ctx.createOscillator();
        const kg = ctx.createGain();
        ko.type = 'sine';
        ko.frequency.setValueAtTime(150, now);
        ko.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        kg.gain.setValueAtTime(0.3, now);
        kg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        ko.connect(kg); kg.connect(bgmGain);
        ko.start(now); ko.stop(now + 0.2);
      }

      // Crisp hi-hat
      if (hatPattern[step]) {
        const hb = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const hd = hb.getChannelData(0);
        for (let i = 0; i < hd.length; i++) hd[i] = (Math.random() * 2 - 1);
        const hs = ctx.createBufferSource();
        const hf = ctx.createBiquadFilter();
        const hg = ctx.createGain();
        hs.buffer = hb;
        hf.type = 'highpass'; hf.frequency.value = 10000;
        hg.gain.setValueAtTime(0.02, now);
        hg.gain.exponentialRampToValueAtTime(0.001, now + bt * 0.4);
        hs.connect(hf); hf.connect(hg); hg.connect(bgmGain);
        hs.start(now);
      }

      // Subtle snare/clap
      if (snarePattern[step]) {
        const sb = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const sd = sb.getChannelData(0);
        for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sd.length * 0.8));
        const ss = ctx.createBufferSource();
        const sg = ctx.createGain();
        ss.buffer = sb;
        sg.gain.setValueAtTime(0.05, now);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        ss.connect(sg); sg.connect(bgmGain);
        ss.start(now);
      }

      // Flowing synth lead
      if (bar >= 1) {
        const mel = sequenceLead[step];
        if (mel > 0) {
          const mo = ctx.createOscillator();
          const mf = ctx.createBiquadFilter();
          const mg = ctx.createGain();
          mo.type = 'square';
          mo.frequency.value = mel;
          
          mf.type = 'lowpass'; mf.frequency.value = 3000;
          mg.gain.setValueAtTime(0, now);
          mg.gain.linearRampToValueAtTime(0.015, now + 0.01);
          mg.gain.exponentialRampToValueAtTime(0.001, now + bt * 0.5);
          mo.connect(mf); mf.connect(mg); mg.connect(bgmGain);
          mo.start(now); mo.stop(now + bt);
        }
      }

      beat++;
      nextBeatTimeRef.current = now + bt;
      
      const timeToNext = (nextBeatTimeRef.current - ctx.currentTime) * 1000;
      const timeoutId = setTimeout(playNextBeat, Math.max(0, timeToNext - 20));
      bgmIntervalsRef.current = [timeoutId, () => { isPlaying = false; }];
    };

    nextBeatTimeRef.current = ctx.currentTime;
    playNextBeat();
  }, [initAudio]);

  const stopBGM = useCallback(() => {
    bgmIntervalsRef.current.forEach((item) => {
      if (typeof item === 'function') item(); // flag isPlaying = false
      else clearTimeout(item); // clear timeout
    });
    bgmIntervalsRef.current = [];
    bgmLevelRef.current = 1;
  }, []);

  const startAmbience = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    osc.type = 'sine'; osc.frequency.value = 38;
    f.type = 'lowpass'; f.frequency.value = 70;
    g.gain.value = 0.012;
    osc.connect(f); f.connect(g); g.connect(bgmGainRef.current || ctx.destination);
    osc.start();
    ambienceNodeRef.current = { osc, gain: g };
  }, []);

  const stopAmbience = useCallback(() => {
    if (ambienceNodeRef.current) {
      try {
        ambienceNodeRef.current.osc.stop();
        ambienceNodeRef.current.osc.disconnect();
        ambienceNodeRef.current.gain.disconnect();
      } catch {}
      ambienceNodeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBGM(); stopAmbience();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [stopBGM, stopAmbience]);

  return {
    initAudio, isMuted, toggleMute,
    playKeySound, playLaserSound, playCompleteSound,
    playMissSound, playLevelUpSound, playGameOverSound,
    startBGM, stopBGM, startAmbience, stopAmbience, setBGMLevel,
  };
}
