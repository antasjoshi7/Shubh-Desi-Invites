// Plays background music in the browser (for the track previews and "Preview video").

import { SAMPLE_RATE, getLoop, musicFor, setTrackLoop, hasTrackLoop, MUSIC, Loop } from "./music";

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

// Decodes a song file into a 44.1 kHz stereo loop.
export async function decodeAudioArrayBuffer(arrayBuffer: ArrayBuffer): Promise<Loop> {
  const ctx = audioContext();
  const audioBuf = await ctx.decodeAudioData(arrayBuffer);
  
  // Resample/render to exact 44100 stereo
  const OfflineCtx = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offline = new OfflineCtx(2, Math.ceil(audioBuf.duration * SAMPLE_RATE), SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = audioBuf;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  
  const left = new Float32Array(rendered.getChannelData(0));
  const right = new Float32Array(rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : left);
  return { left, right, seconds: rendered.duration };
}

const loadingPromises = new Map<string, Promise<Loop>>();

// Downloads a song the first time it's needed (▶ in the list, Play, or making a video), then keeps it.
export async function loadTrackFile(id: string, url: string): Promise<Loop> {
  if (hasTrackLoop(id)) return getLoop(id);
  if (loadingPromises.has(id)) return loadingPromises.get(id)!;

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      const loop = await decodeAudioArrayBuffer(ab);
      setTrackLoop(id, loop);
      return loop;
    } catch (e) {
      console.warn("Couldn't load the song, the video stays quiet", url, e);
      return getLoop(id);
    } finally {
      loadingPromises.delete(id);
    }
  })();

  loadingPromises.set(id, promise);
  return promise;
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

export async function ensureTrackLoaded(id: string): Promise<Loop> {
  const track = MUSIC.find((t) => t.id === id);
  if (track?.file && !hasTrackLoop(id)) {
    return loadTrackFile(id, track.file);
  }
  return getLoop(id);
}

// Loops one track until stopped (the ▶ buttons in the music list).
export function playTrack(id: string, volume: number): () => void {
  const track = MUSIC.find((t) => t.id === id);
  if (track?.file && !hasTrackLoop(id)) {
    let stopped = false;
    let stopFn: (() => void) | null = null;
    loadTrackFile(id, track.file).then((loop) => {
      if (!stopped) {
        stopFn = play(makeAudioBuffer(loop.left, loop.right), true, volume);
      }
    });
    return () => {
      stopped = true;
      stopFn?.();
    };
  }
  const loop = getLoop(id);
  return play(makeAudioBuffer(loop.left, loop.right), true, volume);
}

// Plays music exactly as it will sound in the video (looped to length, faded out).
export function playForVideo(id: string, seconds: number, volume: number): () => void {
  const track = MUSIC.find((t) => t.id === id);
  if (track?.file && !hasTrackLoop(id)) {
    let stopped = false;
    let stopFn: (() => void) | null = null;
    loadTrackFile(id, track.file).then(() => {
      if (!stopped) {
        const { left, right } = musicFor(id, seconds, volume);
        stopFn = play(makeAudioBuffer(left, right), false);
      }
    });
    return () => {
      stopped = true;
      stopFn?.();
    };
  }
  const { left, right } = musicFor(id, seconds, volume);
  return play(makeAudioBuffer(left, right), false);
}
