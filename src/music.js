// A soft music-box lullaby, synthesised in the browser (no audio files, works offline).

const BEAT = 0.92; // seconds per beat, slow 3/4
const R = null;
// Three beats per bar, sixteen bars. MIDI note numbers.
const MELODY = [
  76, 79, 84, 83, 79, R, 81, 77, 81, 79, R, R,
  76, 79, 84, 86, 83, R, 84, 81, 77, 79, R, R,
  81, 84, 81, 79, 76, R, 77, 81, 77, 76, R, R,
  74, 77, 81, 79, 76, 72, 74, 76, 74, 72, R, R,
];
const BASS = [60, 55, 53, 60, 60, 55, 53, 60, 53, 60, 53, 60, 55, 60, 55, 60];

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

let ctx = null;
let master = null;
let timer = null;
let nextTime = 0;
let step = 0;

function tone(freq, at, volume, length) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

function schedule() {
  while (nextTime < ctx.currentTime + 0.8) {
    const note = MELODY[step % MELODY.length];
    if (note !== R) {
      tone(hz(note), nextTime, 0.16, 2.4);
      tone(hz(note) * 2, nextTime, 0.035, 0.7); // the bright "ping" of a music box
    }
    if (step % 3 === 0) tone(hz(BASS[(step / 3) % BASS.length]), nextTime, 0.1, 2.6);
    nextTime += BEAT;
    step++;
  }
}

export function startMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!ctx) {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  ctx.resume?.();
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8);
  if (timer) return;
  nextTime = ctx.currentTime + 0.15;
  step = 0;
  schedule();
  timer = setInterval(schedule, 250);
}

export function stopMusic() {
  if (!ctx || !timer) return;
  clearInterval(timer);
  timer = null;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
}
