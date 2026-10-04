// Animal voices: real recordings from Wikimedia Commons (credits are on the help page), in public/sounds.

const BASE = import.meta.env.BASE_URL;
const MAX_SECONDS = 4; // some recordings are long; a touch gets one short call

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
      fetch(`${BASE}sounds/${name}.mp3?v=2`)
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

export async function playAnimal(name) {
  if (!audio()) return;
  const buffer = await load(name);
  if (!buffer) return;
  playing?.stop();
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.connect(gain).connect(ctx.destination);
  const length = Math.min(buffer.duration, MAX_SECONDS);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(1, now);
  gain.gain.setValueAtTime(1, now + Math.max(0, length - 0.3));
  gain.gain.linearRampToValueAtTime(0, now + length);
  source.start(now);
  source.stop(now + length);
  source.onended = () => playing === source && (playing = null);
  playing = source;
}
