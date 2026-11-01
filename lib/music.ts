// Background music, composed and synthesised in code (no audio files, no licences needed).
// Each track is an exact loop of up to 15 seconds: notes and echoes that run past the end
// wrap round to the start, so the loop is seamless however long the video is.

export const SAMPLE_RATE = 44100;
const SR = SAMPLE_RATE;
type Buf = Float32Array;

export type TrackInfo = { id: string; name: string; mood: string };
export type Loop = { left: Buf; right: Buf; seconds: number };

// ---------------------------------------------------------------- random + helpers

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const hz = (sa: number, semitones: number) => sa * Math.pow(2, semitones / 12);

// degree d of a scale (7 = Sa an octave up for 7-note scales, 5 for 5-note scales)
function deg(scale: number[], d: number) {
  const n = scale.length;
  return scale[((d % n) + n) % n] + 12 * Math.floor(d / n);
}

const YAMAN = [0, 2, 4, 6, 7, 9, 11];
const BHAIRAV = [0, 1, 4, 5, 7, 8, 11];
const KHAMAJ = [0, 2, 4, 5, 7, 9, 10];
const BHUPALI = [0, 2, 4, 7, 9];
const BHAIRAVI = [0, 1, 3, 5, 7, 8, 10];
const BILAWAL = [0, 2, 4, 5, 7, 9, 11];

// ---------------------------------------------------------------- instruments

// Plucked string (Karplus–Strong). buzz adds the sitar/tanpura "jawari" shimmer.
function pluck(f: number, dur: number, decay = 0.996, bright = 0.6, buzz = 0, seed = 1): Buf {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  const N = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(N);
  const r = rng(Math.round(f * 997) + seed);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const x = r() * 2 - 1;
    prev = bright * x + (1 - bright) * prev;
    buf[i] = prev;
  }
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const a = buf[idx];
    const b = buf[(idx + 1) % N];
    buf[idx] = decay * 0.5 * (a + b);
    idx = (idx + 1) % N;
    out[i] = buzz ? Math.tanh(a * (1 + buzz * 3)) / (1 + buzz) : a;
  }
  fadeEnd(out, 0.03);
  return out;
}

// Santoor: two slightly detuned bright strikes.
function santoor(f: number, dur = 1.6, seed = 1): Buf {
  const a = pluck(f, dur, 0.995, 0.9, 0, seed);
  const b = pluck(f * 1.004, dur, 0.995, 0.9, 0, seed + 7);
  for (let i = 0; i < a.length; i++) a[i] = (a[i] + b[i]) * 0.5;
  return a;
}

// Sustained tone built from harmonics, with optional vibrato and a glide from the previous note.
function tone(
  f: number,
  dur: number,
  o: { harm: number[]; attack?: number; release?: number; vib?: number; vibRate?: number; glideFrom?: number; breath?: number; tremolo?: number },
): Buf {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  const attack = o.attack ?? 0.05;
  const release = o.release ?? 0.15;
  const r = rng(Math.round(f * 31));
  let phase = 0;
  let noise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const vib = (o.vib ?? 0) * Math.min(1, Math.max(0, (t - 0.18) / 0.3)) * Math.sin(2 * Math.PI * (o.vibRate ?? 5) * t);
    const base = o.glideFrom ? o.glideFrom + (f - o.glideFrom) * Math.min(1, t / 0.09) : f;
    phase += (2 * Math.PI * base * (1 + vib)) / SR;
    let s = 0;
    for (let k = 0; k < o.harm.length; k++) s += o.harm[k] * Math.sin((k + 1) * phase);
    if (o.breath) {
      noise = 0.85 * noise + 0.15 * (r() * 2 - 1);
      s += noise * o.breath;
    }
    if (o.tremolo) s *= 1 + o.tremolo * Math.sin(2 * Math.PI * 4 * t);
    const env = Math.min(1, t / attack) * Math.min(1, (dur - t) / release);
    out[i] = s * Math.max(0, env);
  }
  return out;
}

const flute = (f: number, dur: number, glideFrom?: number) =>
  tone(f, dur, { harm: [1, 0.22, 0.07], attack: 0.07, release: 0.18, vib: 0.006, vibRate: 5, glideFrom, breath: 0.05 });
const shehnai = (f: number, dur: number, glideFrom?: number) =>
  tone(f, dur, { harm: [1, 0.85, 0.7, 0.55, 0.42, 0.32, 0.22, 0.15, 0.1], attack: 0.04, release: 0.1, vib: 0.01, vibRate: 5.5, glideFrom, breath: 0.03 });
const harmonium = (f: number, dur: number) =>
  tone(f, dur, { harm: [1, 0.7, 0.5, 0.42, 0.3, 0.24, 0.18, 0.12], attack: 0.06, release: 0.12, tremolo: 0.04 });
const pad = (f: number, dur: number) => {
  const a = tone(f * 1.003, dur, { harm: [1, 0.45, 0.25, 0.12], attack: 0.9, release: 1.0 });
  const b = tone(f * 0.997, dur, { harm: [1, 0.45, 0.25, 0.12], attack: 0.9, release: 1.0 });
  for (let i = 0; i < a.length; i++) a[i] = (a[i] + b[i]) * 0.5;
  return a;
};

// Drum: a tone that slides from f0 to f1, plus a noisy attack.
function drum(f0: number, f1: number, dur: number, decay: number, noise: number, harm: number[] = [1], seed = 3): Buf {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  const r = rng(seed + Math.round(f0));
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.04);
    phase += (2 * Math.PI * f) / SR;
    let s = 0;
    for (let k = 0; k < harm.length; k++) s += harm[k] * Math.sin((k + 1) * phase);
    s *= Math.exp(-t / decay);
    s += (r() * 2 - 1) * noise * Math.exp(-t / 0.012);
    out[i] = s;
  }
  fadeEnd(out, 0.01);
  return out;
}

// tabla, dholak and dhol strokes
const na = () => drum(430, 410, 0.4, 0.12, 0.25, [1, 0.55, 0.38, 0.22]);
const tin = () => drum(520, 520, 0.5, 0.2, 0.1, [1, 0.35, 0.18]);
const ge = () => drum(150, 85, 0.7, 0.26, 0.08, [1, 0.2]);
const ke = () => drum(320, 220, 0.1, 0.03, 0.55, [1]);
const dha = () => mixInto(na(), ge());
const dhum = () => drum(115, 72, 0.5, 0.17, 0.15, [1, 0.3]);
const ta = () => drum(620, 520, 0.15, 0.05, 0.5, [1, 0.55, 0.3]);
const dhol = () => drum(85, 52, 0.7, 0.28, 0.22, [1, 0.4]);
const tilli = () => drum(950, 820, 0.1, 0.03, 0.7, [1, 0.3]);

function clap(seed = 5): Buf {
  const n = Math.floor(0.18 * SR);
  const out = new Float32Array(n);
  const r = rng(seed);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const burst = [0, 0.012, 0.024].reduce((acc, s) => acc + (t >= s ? Math.exp(-(t - s) / 0.02) : 0), 0);
    const x = r() * 2 - 1;
    out[i] = (x - prev) * burst * 0.5; // high-passed noise
    prev = x;
  }
  return out;
}

// ankle bells: a cluster of tiny high jingles
function ghungroo(seed = 9): Buf {
  const n = Math.floor(0.3 * SR);
  const out = new Float32Array(n);
  const r = rng(seed);
  for (let k = 0; k < 12; k++) {
    const f = 4200 + r() * 3800;
    const start = Math.floor(r() * 0.03 * SR);
    const decay = 0.04 + r() * 0.08;
    const amp = 0.15 + r() * 0.15;
    for (let i = start; i < n; i++) {
      const t = (i - start) / SR;
      out[i] += amp * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / decay);
    }
  }
  return out;
}

// temple bell: inharmonic partials with long decays
function bell(f: number, dur = 4): Buf {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  const parts: [number, number, number][] = [
    [1, 1, 3.2],
    [2.76, 0.55, 2],
    [5.4, 0.38, 1.2],
    [8.93, 0.22, 0.7],
    [13.34, 0.12, 0.45],
  ];
  for (const [m, a, d] of parts) {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      out[i] += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-t / d) * (1 + 0.15 * Math.sin(2 * Math.PI * 1.3 * t));
    }
  }
  fadeEnd(out, 0.1);
  return out;
}

function mixInto(a: Buf, b: Buf): Buf {
  const out = new Float32Array(Math.max(a.length, b.length));
  for (let i = 0; i < out.length; i++) out[i] = (a[i] ?? 0) + (b[i] ?? 0);
  return out;
}

function fadeEnd(b: Buf, seconds: number) {
  const n = Math.min(b.length, Math.floor(seconds * SR));
  for (let i = 0; i < n; i++) b[b.length - 1 - i] *= i / n;
}

// ---------------------------------------------------------------- the loop "tape"

class Mix {
  left: Buf;
  right: Buf;
  len: number;
  seconds: number;
  constructor(seconds: number) {
    this.seconds = seconds;
    this.len = Math.floor(seconds * SR);
    this.left = new Float32Array(this.len);
    this.right = new Float32Array(this.len);
  }
  // place a sound at time t (seconds); anything past the end wraps to the start
  add(b: Buf, t: number, gain = 1, pan = 0) {
    const start = Math.floor(t * SR);
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < b.length; i++) {
      const j = (start + i) % this.len;
      this.left[j] += b[i] * gl;
      this.right[j] += b[i] * gr;
    }
  }
}

// Room echo (Schroeder reverb), run over the loop twice so the tail wraps seamlessly.
function reverb(m: Mix, wet: number) {
  const len = m.len;
  const input = new Float32Array(len);
  for (let i = 0; i < len; i++) input[i] = (m.left[i] + m.right[i]) * 0.5;
  const run = (combs: number[], allpasses: number[]) => {
    let sig = new Float32Array(len);
    for (const d of combs) {
      const buf = new Float32Array(d);
      let idx = 0;
      let lp = 0;
      for (let i = 0; i < 2 * len; i++) {
        const y = buf[idx];
        lp = y * 0.75 + lp * 0.25;
        buf[idx] = input[i % len] + lp * 0.83;
        idx = (idx + 1) % d;
        if (i >= len) sig[i - len] += y;
      }
    }
    for (const d of allpasses) {
      const buf = new Float32Array(d);
      const res = new Float32Array(len);
      let idx = 0;
      for (let i = 0; i < 2 * len; i++) {
        const x = sig[i % len];
        const b = buf[idx];
        buf[idx] = x + b * 0.5;
        idx = (idx + 1) % d;
        if (i >= len) res[i - len] = b - x * 0.5;
      }
      sig = res;
    }
    return sig;
  };
  const wl = run([1557, 1617, 1491, 1422], [225, 556]);
  const wr = run([1580, 1640, 1514, 1445], [248, 579]);
  for (let i = 0; i < len; i++) {
    m.left[i] += wl[i] * wet * 0.22;
    m.right[i] += wr[i] * wet * 0.22;
  }
}

// gentle limiter + normalise
function master(m: Mix): Loop {
  let peak = 0;
  for (let i = 0; i < m.len; i++) {
    m.left[i] = Math.tanh(m.left[i] * 1.2);
    m.right[i] = Math.tanh(m.right[i] * 1.2);
    peak = Math.max(peak, Math.abs(m.left[i]), Math.abs(m.right[i]));
  }
  const g = peak > 0 ? 0.85 / peak : 1;
  for (let i = 0; i < m.len; i++) {
    m.left[i] *= g;
    m.right[i] *= g;
  }
  return { left: m.left, right: m.right, seconds: m.seconds };
}

// ---------------------------------------------------------------- shared parts

// Tanpura drone: Pa, Sa', Sa', Sa plucked every beat, for the whole loop.
function tanpura(m: Mix, sa: number, beat: number, beats: number, gain = 0.3, second = 7) {
  const notes = [hz(sa, second - 12), sa * 2, sa * 2, sa];
  for (let b = 0; b < beats; b++) {
    m.add(pluck(notes[b % 4], beat * 4.5, 0.9993, 0.45, 0.6, b), b * beat, gain, b % 2 ? 0.3 : -0.3);
  }
}

// Play a rhythm written as text: each item is one step, "." is a rest.
function rhythm(m: Mix, pattern: string, step: number, strokes: Record<string, () => Buf>, gain: number, from = 0, times = 1) {
  const items = pattern.trim().split(/\s+/);
  for (let r = 0; r < times; r++) {
    items.forEach((s, i) => {
      if (s !== "." && strokes[s]) m.add(strokes[s](), from + (r * items.length + i) * step, gain, ((i % 3) - 1) * 0.15);
    });
  }
}

// Melody written as [degree, start beat, length in beats]. Glides between notes when glide is set.
function melody(
  m: Mix,
  notes: [number, number, number][],
  scale: number[],
  sa: number,
  beat: number,
  play: (f: number, dur: number, glideFrom?: number) => Buf,
  gain: number,
  pan = 0,
  glide = false,
) {
  let prev: number | undefined;
  for (const [d, start, len] of notes) {
    const f = hz(sa, deg(scale, d));
    m.add(play(f, len * beat + 0.12, glide ? prev : undefined), start * beat, gain, pan);
    prev = f;
  }
}

// eighth-note line written as degrees (-1 = rest)
function line(m: Mix, degrees: number[], scale: number[], sa: number, step: number, gain: number, play: (f: number) => Buf, from = 0) {
  degrees.forEach((d, i) => {
    if (d >= 0) m.add(play(hz(sa, deg(scale, d))), from + i * step, gain, Math.sin(i * 1.7) * 0.4);
  });
}

// ---------------------------------------------------------------- the 10 tracks

const D3 = 146.83;
const CS3 = 138.59;

const TRACKS: (TrackInfo & { make: () => Loop })[] = [
  {
    id: "santoor-dawn",
    name: "Santoor Dawn",
    mood: "Calm",
    make: () => {
      const beat = 60 / 80; // 16 beats = 12s
      const m = new Mix(16 * beat);
      tanpura(m, D3, beat, 16, 0.28);
      line(m, [7, 8, 9, 11, 12, 11, 9, 8, 7, -1, 6, 7, 9, 7, 6, 4, 5, -1, 4, 2, 4, 5, 7, -1, 9, 8, 7, 6, 4, 2, 0, -1], YAMAN, D3 * 2, beat / 2, 0.2, (f) => santoor(f));
      reverb(m, 0.5);
      return master(m);
    },
  },
  {
    id: "shehnai-welcome",
    name: "Shehnai Welcome",
    mood: "Auspicious",
    make: () => {
      const beat = 60 / 72; // 16 beats ≈ 13.3s
      const m = new Mix(16 * beat);
      tanpura(m, D3, beat, 16, 0.25);
      melody(
        m,
        [[4, 0, 1.5], [5, 1.5, 0.5], [4, 2, 1], [3, 3, 1], [2, 4, 2], [1, 6, 1], [0, 7, 1], [1, 8, 0.5], [2, 8.5, 0.5], [3, 9, 1], [4, 10, 2], [5, 12, 1], [4, 13, 1], [2, 14, 1], [0, 15, 1]],
        BHAIRAV, D3 * 2, beat, shehnai, 0.2, 0.1, true,
      );
      rhythm(m, "dhum . ta . dhum . ta .", beat, { dhum, ta }, 0.22, 0, 2);
      reverb(m, 0.4);
      return master(m);
    },
  },
  {
    id: "sitar-raga",
    name: "Sitar Raga",
    mood: "Elegant",
    make: () => {
      const beat = 60 / 70; // 16 beats ≈ 13.7s
      const m = new Mix(16 * beat);
      tanpura(m, CS3, beat, 16, 0.25);
      const sitar = (f: number) => pluck(f, 2.2, 0.997, 0.75, 0.8);
      line(m, [7, -1, 6, 5, 4, -1, 5, 6, 7, 9, 8, 7, 5, -1, 4, 2, 4, -1, 5, 4, 2, 1, 0, -1, 2, 4, 5, 6, 7, -1, -1, -1], KHAMAJ, CS3 * 2, beat / 2, 0.24, sitar);
      rhythm(m, "dha dhin dhin dha dha dhin dhin dha dha tin tin ta ta dhin dhin dha", beat, { dha, dhin: dha, tin, ta: na }, 0.28);
      reverb(m, 0.35);
      return master(m);
    },
  },
  {
    id: "dholak-sangeet",
    name: "Dholak Sangeet",
    mood: "Festive",
    make: () => {
      const beat = 60 / 120; // 24 beats = 12s
      const m = new Mix(24 * beat);
      rhythm(m, "dhum . ta dhum . dhum ta .", beat / 2, { dhum, ta }, 0.4, 0, 6);
      rhythm(m, ". clap . clap", beat, { clap: () => clap() }, 0.35, 0, 6);
      const sa = 220;
      const chords = [[0, 4, 7], [-2, 2, 5], [5, 9, 12], [0, 4, 7], [0, 4, 7], [-2, 2, 5], [7, 11, 14], [0, 4, 7]];
      chords.forEach((c, i) => c.forEach((st) => m.add(harmonium(hz(sa, st), beat * 3), i * 3 * beat, 0.09, 0)));
      melody(m, [[4, 0, 1], [5, 1, 1], [7, 2, 2], [5, 4, 1], [4, 5, 1], [2, 6, 2], [4, 12, 1], [5, 13, 1], [7, 14, 1], [9, 15, 1], [7, 16, 2], [5, 18, 1], [4, 19, 1], [2, 20, 2], [0, 22, 2]], KHAMAJ, sa * 2, beat, shehnai, 0.12, 0.2, true);
      reverb(m, 0.25);
      return master(m);
    },
  },
  {
    id: "temple-bells",
    name: "Temple Bells",
    mood: "Devotional",
    make: () => {
      const beat = 1; // 12 beats = 12s
      const m = new Mix(12);
      tanpura(m, D3, beat, 12, 0.25);
      m.add(bell(D3 * 4), 0, 0.22, -0.3);
      m.add(bell(hz(D3 * 4, 7)), 6, 0.18, 0.3);
      m.add(bell(D3 * 8, 2.5), 3, 0.08, 0.5);
      m.add(bell(D3 * 8, 2.5), 9, 0.08, -0.5);
      melody(m, [[2, 0, 3], [3, 3, 3], [4, 6, 2], [3, 8, 2], [2, 10, 2]], BHUPALI, D3 * 4, beat, flute, 0.16, 0, true);
      reverb(m, 0.6);
      return master(m);
    },
  },
  {
    id: "bansuri-breeze",
    name: "Bansuri Breeze",
    mood: "Romantic",
    make: () => {
      const beat = 60 / 84; // 20 beats ≈ 14.3s
      const m = new Mix(20 * beat);
      tanpura(m, D3, beat, 20, 0.22);
      melody(
        m,
        [[5, 0, 1.5], [6, 1.5, 0.5], [7, 2, 2], [6, 4, 1], [5, 5, 0.5], [3, 5.5, 0.5], [2, 6, 2], [3, 8, 1], [5, 9, 1], [6, 10, 1.5], [5, 11.5, 0.5], [3, 12, 2], [2, 14, 1], [1, 15, 1], [0, 16, 3]],
        BHUPALI, D3 * 2, beat, flute, 0.24, -0.1, true,
      );
      rhythm(m, "dha ge na ti na ke dhi na", beat / 2, { dha, ge, na, ti: tin, ke, dhi: dha }, 0.18, 0, 5);
      reverb(m, 0.5);
      return master(m);
    },
  },
  {
    id: "mehendi-groove",
    name: "Mehendi Groove",
    mood: "Playful",
    make: () => {
      const beat = 60 / 104; // 24 beats ≈ 13.8s
      const m = new Mix(24 * beat);
      rhythm(m, "dhum ta . ta dhum . ta ta", beat / 2, { dhum, ta }, 0.38, 0, 6);
      rhythm(m, ". . clap .", beat, { clap: () => clap(7) }, 0.3, 0, 6);
      const riff = [7, 9, 10, 9, 7, 5, 4, 5, 7, -1, 7, 9, 7, 5, 4, -1];
      for (let r = 0; r < 3; r++) line(m, r === 2 ? [9, 10, 12, 10, 9, 7, 5, 7, 9, -1, 9, 10, 9, 7, 5, -1] : riff, KHAMAJ, D3 * 2, beat / 2, 0.2, (f) => santoor(f, 1.2), r * 8 * beat);
      m.add(pluck(D3 / 2, beat * 8, 0.998, 0.4), 0, 0.3);
      m.add(pluck(hz(D3 / 2, 5), beat * 8, 0.998, 0.4), 8 * beat, 0.3);
      m.add(pluck(hz(D3 / 2, 7), beat * 8, 0.998, 0.4), 16 * beat, 0.3);
      reverb(m, 0.3);
      return master(m);
    },
  },
  {
    id: "baraat-procession",
    name: "Baraat Procession",
    mood: "Royal",
    make: () => {
      const beat = 60 / 116; // 24 beats ≈ 12.4s
      const m = new Mix(24 * beat);
      rhythm(m, "dhol . tilli dhol tilli . dhol tilli", beat / 2, { dhol, tilli }, 0.42, 0, 6);
      rhythm(m, "tilli tilli tilli tilli", beat / 4, { tilli }, 0.18, 22 * beat, 2);
      melody(
        m,
        [[4, 0, 1], [4, 1, 0.5], [5, 1.5, 0.5], [7, 2, 2], [8, 4, 1], [7, 5, 1], [5, 6, 2], [4, 8, 1], [5, 9, 1], [4, 10, 1], [2, 11, 1], [4, 12, 2], [7, 14, 2], [8, 16, 1], [9, 17, 1], [8, 18, 1], [7, 19, 1], [5, 20, 2], [4, 22, 2]],
        BILAWAL, 293.66, beat, shehnai, 0.2, 0, true,
      );
      reverb(m, 0.3);
      return master(m);
    },
  },
  {
    id: "romantic-strings",
    name: "Romantic Strings",
    mood: "Dreamy",
    make: () => {
      const beat = 60 / 66; // 16 beats ≈ 14.5s
      const m = new Mix(16 * beat);
      const sa = 196;
      const chords = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]];
      chords.forEach((c, i) => {
        c.forEach((st) => m.add(pad(hz(sa, st), beat * 4.6), i * 4 * beat, 0.12));
        m.add(pluck(hz(sa / 2, c[0]), beat * 4, 0.998, 0.35), i * 4 * beat, 0.3);
      });
      line(m, [7, 9, 11, 14, 11, 9, 7, 4, 5, 7, 9, 12, 9, 7, 5, 2, 4, 5, 7, 9, 7, 5, 4, 0, 2, 4, 6, 9, 6, 4, 2, -1], BILAWAL, sa * 2, beat / 2, 0.12, (f) => santoor(f, 1.4));
      reverb(m, 0.6);
      return master(m);
    },
  },
  {
    id: "ghungroo-kathak",
    name: "Ghungroo Kathak",
    mood: "Dance",
    make: () => {
      const beat = 60 / 96; // 24 beats = 15s
      const m = new Mix(24 * beat);
      tanpura(m, CS3, beat, 24, 0.18, 5);
      rhythm(m, "dha ti ra ki ta ka dha . dha ti ra ki ta ka dha .", beat / 4, { dha, ti: ke, ra: na, ki: ke, ta: na, ka: ke }, 0.26, 0, 6);
      rhythm(m, "g . g . g g g .", beat, { g: () => ghungroo(3) }, 0.4, 0, 3);
      const sitar = (f: number) => pluck(f, 1.6, 0.996, 0.8, 0.7);
      line(m, [7, 8, 7, 5, 3, 5, 7, -1, 8, 10, 8, 7, 5, 3, 1, 0], BHAIRAVI, CS3 * 2, beat / 2, 0.22, sitar, 8 * beat);
      line(m, [0, 1, 3, 5, 7, 5, 3, 1, 0, -1, 3, 1, 0, -1, -1, -1], BHAIRAVI, CS3 * 2, beat / 2, 0.22, sitar, 16 * beat);
      reverb(m, 0.35);
      return master(m);
    },
  },
];

export const MUSIC: TrackInfo[] = TRACKS.map(({ id, name, mood }) => ({ id, name, mood }));

const cache = new Map<string, Loop>();

// The loop for a track (made once, then remembered).
export function getLoop(id: string): Loop {
  let loop = cache.get(id);
  if (!loop) {
    loop = TRACKS.find((t) => t.id === id)!.make();
    cache.set(id, loop);
  }
  return loop;
}

// The loop repeated to fill `seconds`, at `volume`, fading out over the last 1.5s.
export function musicFor(id: string, seconds: number, volume: number): { left: Buf; right: Buf } {
  const loop = getLoop(id);
  const n = Math.ceil(seconds * SR);
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  const L = loop.left.length;
  const fadeIn = Math.floor(0.05 * SR);
  const fadeOut = Math.floor(Math.min(1.5, seconds / 3) * SR);
  for (let i = 0; i < n; i++) {
    let g = volume;
    if (i < fadeIn) g *= i / fadeIn;
    if (i > n - fadeOut) g *= (n - i) / fadeOut;
    left[i] = loop.left[i % L] * g;
    right[i] = loop.right[i % L] * g;
  }
  return { left, right };
}
