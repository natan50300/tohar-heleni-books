// Animal voices, synthesised in the browser (no audio files, works offline).
// Each voice is a buzzing source shaped by "formant" filters, the way a throat and mouth shape a call.

let ctx = null;
let noiseBuffer = null;

function audio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  ctx.resume?.();
  return ctx;
}

// Follow a curve of [fraction of the sound, value] points.
function curve(param, points, start, dur) {
  param.setValueAtTime(points[0][1], start);
  for (const [t, v] of points.slice(1)) param.linearRampToValueAtTime(v, start + t * dur);
}

const flat = (v) => (Array.isArray(v) ? v : [[0, v]]);

function voice({ at = 0, dur, f0, formants, type = 'sawtooth', vol = 0.5, vib, trem, noise = 0, attack = 0.03, release = 0.1 }) {
  const start = ctx.currentTime + 0.03 + at;
  const end = start + dur;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(vol, start + attack);
  env.gain.setValueAtTime(vol, Math.max(start + attack, end - release));
  env.gain.linearRampToValueAtTime(0, end);
  env.connect(ctx.destination);

  let out = env;
  if (trem) {
    // A fast wobble in loudness: the bleat of a sheep.
    const wobble = ctx.createGain();
    wobble.gain.value = 1 - trem.depth / 2;
    const lfo = ctx.createOscillator();
    const amount = ctx.createGain();
    lfo.frequency.value = trem.rate;
    amount.gain.value = trem.depth / 2;
    lfo.connect(amount).connect(wobble.gain);
    lfo.start(start);
    lfo.stop(end);
    wobble.connect(env);
    out = wobble;
  }

  const osc = ctx.createOscillator();
  osc.type = type;
  curve(osc.frequency, flat(f0), start, dur);
  if (vib) {
    const lfo = ctx.createOscillator();
    const amount = ctx.createGain();
    lfo.frequency.value = vib.rate;
    amount.gain.value = vib.depth;
    lfo.connect(amount).connect(osc.frequency);
    lfo.start(start);
    lfo.stop(end);
  }
  const sources = [osc];
  if (noise) {
    const breath = ctx.createBufferSource();
    breath.buffer = noiseBuffer;
    breath.loop = true;
    const level = ctx.createGain();
    level.gain.value = noise;
    breath.connect(level);
    breath.start(start);
    breath.stop(end);
    sources.push(level);
  }

  for (const { f, q = 4, g = 1 } of formants) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = q;
    curve(filter.frequency, flat(f), start, dur);
    const level = ctx.createGain();
    level.gain.value = g;
    sources.forEach((s) => s.connect(filter));
    filter.connect(level).connect(out);
  }
  osc.start(start);
  osc.stop(end);
}

const VOICES = {
  cow: () =>
    voice({
      dur: 1.7, vol: 0.9, attack: 0.2, release: 0.5,
      f0: [[0, 120], [0.15, 150], [0.6, 135], [1, 100]],
      formants: [{ f: [[0, 280], [0.25, 380], [1, 320]], q: 4 }, { f: [[0, 700], [0.3, 850], [1, 700]], q: 5, g: 0.5 }],
    }),
  sheep: () =>
    voice({
      dur: 0.95, vol: 0.6, attack: 0.05, release: 0.2, trem: { rate: 11, depth: 0.7 },
      f0: [[0, 360], [0.2, 400], [1, 330]],
      formants: [{ f: 750, q: 4 }, { f: 1700, q: 6, g: 0.6 }],
    }),
  duck: () =>
    [0, 0.2, 0.4].forEach((at) =>
      voice({
        at, dur: 0.14, vol: 0.45, type: 'square', attack: 0.01, release: 0.05,
        f0: [[0, 520], [1, 380]],
        formants: [{ f: 1000, q: 3 }, { f: 2300, q: 5, g: 0.7 }],
      }),
    ),
  dog: () =>
    [0, 0.28].forEach((at) =>
      voice({
        at, dur: 0.18, vol: 0.8, noise: 0.3, attack: 0.01, release: 0.08,
        f0: [[0, 420], [0.3, 300], [1, 160]],
        formants: [{ f: 600, q: 2 }, { f: 1300, q: 3, g: 0.5 }],
      }),
    ),
  cat: () =>
    voice({
      dur: 0.9, vol: 0.5, attack: 0.08, release: 0.25,
      f0: [[0, 480], [0.3, 720], [0.7, 650], [1, 430]],
      formants: [{ f: [[0, 600], [0.35, 1500], [1, 700]], q: 5 }, { f: 2600, q: 6, g: 0.3 }],
    }),
  rooster: () => {
    const formants = [{ f: 1400, q: 4 }, { f: 2800, q: 5, g: 0.6 }];
    voice({ at: 0, dur: 0.13, vol: 0.45, f0: 620, formants, attack: 0.01, release: 0.04 });
    voice({ at: 0.16, dur: 0.13, vol: 0.45, f0: 780, formants, attack: 0.01, release: 0.04 });
    voice({ at: 0.32, dur: 0.16, vol: 0.45, f0: 700, formants, attack: 0.01, release: 0.04 });
    voice({ at: 0.52, dur: 0.75, vol: 0.45, f0: [[0, 880], [0.6, 900], [1, 600]], formants, vib: { rate: 9, depth: 25 }, release: 0.3 });
  },
  hen: () => {
    const formants = [{ f: 1200, q: 4 }, { f: 2600, q: 5, g: 0.6 }];
    [0, 0.14, 0.28].forEach((at) => voice({ at, dur: 0.07, vol: 0.35, type: 'square', f0: 550, formants, attack: 0.005, release: 0.03 }));
    voice({ at: 0.5, dur: 0.18, vol: 0.35, type: 'square', f0: [[0, 500], [1, 800]], formants, attack: 0.01, release: 0.06 });
  },
  horse: () =>
    voice({
      dur: 1.3, vol: 0.5, noise: 0.25, attack: 0.05, release: 0.4, vib: { rate: 13, depth: 90 },
      f0: [[0, 700], [0.1, 1100], [0.5, 800], [1, 380]],
      formants: [{ f: 1100, q: 3 }, { f: 2400, q: 4, g: 0.6 }],
    }),
};

export function playAnimal(name) {
  if (!VOICES[name] || !audio()) return;
  VOICES[name]();
}
