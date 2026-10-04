// Animal voices: real recordings from Wikimedia Commons (credits are on the help page), in public/sounds.

const BASE = import.meta.env.BASE_URL;
const MAX_SECONDS = 4;
// Animals are played a little higher and faster, so they sound small and friendly.
// Some recordings are quiet; bring them up to the level of the others.
const LOUDER = { rain: 3.5, splash: 2.2, waves: 14 };
// Long recordings: where to start, and how many seconds to play.
const CLIP = { waves: [4, 7] };
const CUTE = { cow: 1.22, sheep: 1.15, duck: 1.15, dog: 1.25, cat: 1.1, rooster: 1.12, hen: 1.12, horse: 1.2, frog: 1.15 }; // some recordings are long; a touch gets one short call

let ctx = null;
let playing = null;
const buffers = new Map();

function audio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  ctx.resume?.();
  return ctx;
}

function load(name) {
  if (!buffers.has(name)) {
    buffers.set(
      name,
      fetch(`${BASE}sounds/${name}.mp3?v=5`)
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(name))))
        // Callback form: older iPhones do not return a promise here.
        .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
        .catch(() => {
          buffers.delete(name);
          return null;
        }),
    );
  }
  return buffers.get(name);
}

// Fetch a book's sounds ahead of time, so the first touch answers at once (and they are kept for offline use).
export function prepareAnimals(names) {
  if (!audio()) return;
  names.forEach(load);
}

export async function playAnimal(name, rate = CUTE[name] || 1) {
  if (!audio()) return;
  const buffer = await load(name);
  if (!buffer) return;
  playing?.stop();
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.connect(gain).connect(ctx.destination);
  const [offset, max] = CLIP[name] || [0, MAX_SECONDS];
  const length = Math.min((buffer.duration - offset) / rate, max);
  const now = ctx.currentTime;
  const level = LOUDER[name] || 1;
  gain.gain.setValueAtTime(offset ? 0 : level, now);
  gain.gain.linearRampToValueAtTime(level, now + 0.4);
  gain.gain.setValueAtTime(level, now + Math.max(0.4, length - (offset ? 1.5 : 0.3)));
  gain.gain.linearRampToValueAtTime(0, now + length);
  source.start(now, offset);
  source.stop(now + length);
  source.onended = () => playing === source && (playing = null);
  playing = source;
}

// A sleeping child answers a touch with soft breathing and a slow, quiet lullaby (synthesised, no files).
const LULLABY = [[64, 0.5], [64, 0.5], [67, 2], [64, 0.5], [64, 0.5], [67, 2], [64, 0.5], [67, 0.5], [72, 1], [71, 1.5], [69, 0.5], [69, 1], [67, 2.5]];
let sleepUntil = 0;

export function playSleep() {
  if (!audio() || ctx.currentTime < sleepUntil) return;
  const beat = 0.62;
  let at = ctx.currentTime + 0.1;
  for (const [note, beats] of LULLABY) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440 * 2 ** ((note + 12 - 69) / 12);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.11, at + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + beats * beat + 0.9);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + beats * beat + 1);
    at += beats * beat;
  }
  const end = at + 1;

  // Breathing: filtered noise that swells in and out.
  const length = Math.ceil((end - ctx.currentTime) * ctx.sampleRate);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 520;
  filter.Q.value = 0.8;
  const breath = ctx.createGain();
  breath.gain.setValueAtTime(0, ctx.currentTime);
  for (let t = ctx.currentTime + 0.2; t < end - 3; t += 3.4) {
    breath.gain.linearRampToValueAtTime(0.09, t + 1.2); // in
    breath.gain.linearRampToValueAtTime(0.01, t + 1.6);
    breath.gain.linearRampToValueAtTime(0.06, t + 2.6); // out
    breath.gain.linearRampToValueAtTime(0, t + 3.3);
  }
  noise.connect(filter).connect(breath).connect(ctx.destination);
  noise.start();
  noise.stop(end);
  sleepUntil = end;
}

