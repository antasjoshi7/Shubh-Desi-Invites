// Plays background music in the browser (for the track previews and "Preview video").

import { SAMPLE_RATE, getLoop, musicFor } from "./music";

let context: AudioContext | null = null;

// One shared audio context, started from a tap (browsers require that).
export function audioContext(): AudioContext {
  if (!context) {
    // iPhones mute web audio with the silent switch unless we ask for "playback".
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    context = new Ctx();
  }
  if (context.state === "suspended") context.resume();
  return context;
}

export function makeAudioBuffer(left: Float32Array, right: Float32Array): AudioBuffer {
  const buffer = new AudioBuffer({ length: left.length, numberOfChannels: 2, sampleRate: SAMPLE_RATE });
  buffer.copyToChannel(left as Float32Array<ArrayBuffer>, 0);
  buffer.copyToChannel(right as Float32Array<ArrayBuffer>, 1);
  return buffer;
}

function play(buffer: AudioBuffer, loop: boolean, volume = 1): () => void {
  const ctx = audioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return () => {
    try {
      source.stop();
    } catch {
      // already stopped
    }
  };
}

// Loops one track until stopped (the ▶ buttons in the music list).
export function playTrack(id: string, volume: number): () => void {
  const loop = getLoop(id);
  return play(makeAudioBuffer(loop.left, loop.right), true, volume);
}

// Plays music exactly as it will sound in the video (looped to length, faded out).
export function playForVideo(id: string, seconds: number, volume: number): () => void {
  const { left, right } = musicFor(id, seconds, volume);
  return play(makeAudioBuffer(left, right), false);
}
