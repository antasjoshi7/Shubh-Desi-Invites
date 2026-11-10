// Turns frames drawn by render() into a video file, with optional background music.
// First choice: Mediabunny (fast, exact MP4). Fallback: MediaRecorder (real-time recording).

import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
  canEncodeAudio,
  canEncodeVideo,
} from "mediabunny";
import { audioContext, makeAudioBuffer } from "./audio";
import { SAMPLE_RATE } from "./music";
import { FPS, H, W } from "./render";

// Videos are made at full HD (1080 × 1920) when the phone can encode it, else at 720 × 1280.
export const HD = { w: 1080, h: 1920 };

export type ExportResult = {
  blob: Blob;
  extension: "mp4" | "webm";
  method: "Mediabunny" | "MediaRecorder";
  withMusic: boolean;
};

export type Music = { left: Float32Array; right: Float32Array } | null;

type Draw = (ctx: CanvasRenderingContext2D, time: number) => void;

export async function exportVideo(
  canvas: HTMLCanvasElement,
  duration: number,
  draw: Draw,
  onProgress: (fraction: number) => void,
  music: Music = null,
): Promise<ExportResult> {
  try {
    if (await mediabunnyWorks(canvas.width, canvas.height)) {
      return await exportWithMediabunny(canvas, duration, draw, onProgress, music);
    }
  } catch (err) {
    console.warn("Mediabunny failed, falling back to MediaRecorder", err);
  }
  return exportWithMediaRecorder(canvas, duration, draw, onProgress, music);
}

async function mediabunnyWorks(width: number, height: number): Promise<boolean> {
  if (typeof VideoEncoder === "undefined") return false;
  return canEncodeVideo("avc", { width, height, bitrate: QUALITY_MEDIUM });
}

// The biggest size this browser can encode: full HD if possible.
export async function bestVideoSize(): Promise<{ w: number; h: number }> {
  try {
    if (typeof VideoEncoder !== "undefined" && (await canEncodeVideo("avc", { width: HD.w, height: HD.h, bitrate: QUALITY_MEDIUM }))) return HD;
  } catch {
    // fall through to the smaller size
  }
  return { w: W, h: H };
}

// AAC audio: built into most browsers; otherwise load Mediabunny's AAC encoder add-on.
async function aacReady(): Promise<boolean> {
  const opts = { numberOfChannels: 2, sampleRate: SAMPLE_RATE };
  if (await canEncodeAudio("aac", opts)) return true;
  const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
  registerAacEncoder();
  return canEncodeAudio("aac", opts);
}

async function exportWithMediabunny(
  canvas: HTMLCanvasElement,
  duration: number,
  draw: Draw,
  onProgress: (fraction: number) => void,
  music: Music,
): Promise<ExportResult> {
  const ctx = canvas.getContext("2d")!;
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
  const video = new CanvasSource(canvas, { codec: "avc", bitrate: QUALITY_MEDIUM });
  output.addVideoTrack(video, { frameRate: FPS });

  const audio = music && (await aacReady()) ? new AudioBufferSource({ codec: "aac", bitrate: 128_000 }) : null;
  if (audio) output.addAudioTrack(audio);
  await output.start();

  // music is added one second at a time, alongside the frames
  let audioSent = 0;
  const sendAudioUntil = async (seconds: number) => {
    if (!audio || !music) return;
    const end = Math.min(music.left.length, Math.ceil(seconds * SAMPLE_RATE));
    if (end <= audioSent) return;
    await audio.add(makeAudioBuffer(music.left.subarray(audioSent, end), music.right.subarray(audioSent, end)));
    audioSent = end;
  };

  const totalFrames = Math.round(duration * FPS);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / FPS;
    if (i % FPS === 0) await sendAudioUntil(t + 1);
    draw(ctx, t);
    await video.add(t, 1 / FPS);
    if (i % 10 === 0) onProgress(i / totalFrames);
  }
  await sendAudioUntil(duration);
  await output.finalize();
  onProgress(1);

  const buffer = output.target.buffer!;
  return { blob: new Blob([buffer], { type: "video/mp4" }), extension: "mp4", method: "Mediabunny", withMusic: !!audio };
}

function exportWithMediaRecorder(
  canvas: HTMLCanvasElement,
  duration: number,
  draw: Draw,
  onProgress: (fraction: number) => void,
  music: Music,
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      reject(new Error("This browser can't make videos. Please try Chrome or Safari."));
      return;
    }
    const types = music
      ? ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"]
      : ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    const isMp4 = mimeType.startsWith("video/mp4");

    const ctx = canvas.getContext("2d")!;
    draw(ctx, 0);
    const stream = canvas.captureStream(FPS);

    // music: play it into the recording
    let source: AudioBufferSourceNode | null = null;
    if (music) {
      const ac = audioContext();
      const dest = ac.createMediaStreamDestination();
      source = ac.createBufferSource();
      source.buffer = makeAudioBuffer(music.left, music.right);
      source.connect(dest);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: 6_000_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve({
        blob: new Blob(chunks, { type: isMp4 ? "video/mp4" : "video/webm" }),
        extension: isMp4 ? "mp4" : "webm",
        method: "MediaRecorder",
        withMusic: !!music,
      });
    };

    // Plays the animation in real time while recording.
    recorder.start(250);
    source?.start();
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      draw(ctx, Math.min(t, duration));
      onProgress(Math.min(1, t / duration));
      if (t < duration) requestAnimationFrame(tick);
      else setTimeout(() => recorder.stop(), 100);
    };
    requestAnimationFrame(tick);
  });
}
