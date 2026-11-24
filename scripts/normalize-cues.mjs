/*
 Normalizes the bundled card cues into light mono AAC (.m4a):
   1. afconvert decodes each take to 16-bit PCM WAV.
   2. This script mixes to mono, trims silence below -45 dBFS,
      and peak-normalizes to -1 dBFS.
   3. afconvert re-encodes to AAC at 96 kbps.
 Mapping: reveal1-4.m4a, share1-3+5.m4a (dealt) and shuffle1-4.m4a from ~/Downloads.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = '/Users/machip3r/Downloads';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
mkdirSync(OUT, { recursive: true });

const mapping = {
  'reveal-1': 'reveal1.m4a', 'reveal-2': 'reveal2.m4a', 'reveal-3': 'reveal3.m4a', 'reveal-4': 'reveal4.m4a',
  'deal-1': 'share1.m4a', 'deal-2': 'share2.m4a', 'deal-3': 'share3.m4a', 'deal-4': 'share5.m4a',
  'shuffle-1': 'shuffle1.m4a', 'shuffle-2': 'shuffle2.m4a', 'shuffle-3': 'shuffle3.m4a', 'shuffle-4': 'shuffle4.m4a',
};

function parseWav(path) {
  const buf = readFileSync(path);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Not a WAV: ${path}`);
  let offset = 12, fmt = null, data = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(offset + 8), channels: buf.readUInt16LE(offset + 10), sampleRate: buf.readUInt32LE(offset + 12), bits: buf.readUInt16LE(offset + 22) };
    if (id === 'data') { data = buf.subarray(offset + 8, offset + 8 + size); break; }
    offset += 8 + size + (size % 2);
  }
  if (!fmt || !data || (fmt.format !== 1 && fmt.format !== 0xFFFE) || fmt.bits !== 16) throw new Error(`Unsupported PCM in ${path}`);
  return { fmt, data };
}

function process(raw, fmt) {
  const frames = Math.floor(raw.length / 2 / fmt.channels);
  const mono = new Float64Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < fmt.channels; c++) sum += raw.readInt16LE((i * fmt.channels + c) * 2);
    mono[i] = sum / fmt.channels / 32768;
  }
  const threshold = 0.0056; // -45 dBFS
  const pad = Math.round(fmt.sampleRate * 0.012);
  let start = 0;
  while (start < mono.length && Math.abs(mono[start]) < threshold) start++;
  let end = mono.length;
  while (end > start && Math.abs(mono[end - 1]) < threshold) end--;
  if (end <= start) return { samples: mono, gain: 1, sampleRate: fmt.sampleRate };
  start = Math.max(0, start - pad);
  end = Math.min(mono.length, end + pad);
  let peak = 0;
  for (let i = start; i < end; i++) peak = Math.max(peak, Math.abs(mono[i]));
  const gain = Math.min(8, 0.891 / (peak || 1));
  const samples = new Float64Array(end - start);
  const fade = Math.min(pad, Math.floor(samples.length / 2));
  for (let i = 0; i < samples.length; i++) {
    let value = mono[start + i] * gain;
    if (i < fade) value *= i / fade;
    if (i >= samples.length - fade) value *= (samples.length - 1 - i) / fade;
    samples[i] = value;
  }
  return { samples, gain, sampleRate: fmt.sampleRate };
}

function writeWav(path, samples, sampleRate) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  writeFileSync(path, buf);
}

for (const [name, source] of Object.entries(mapping)) {
  const raw = join(tmpdir(), `plato-${name}-raw.wav`);
  const norm = join(tmpdir(), `plato-${name}-norm.wav`);
  const dest = join(OUT, `${name}.m4a`);
  execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16', join(SRC, source), raw]);
  const { fmt, data } = parseWav(raw);
  const { samples, gain, sampleRate } = process(data, fmt);
  writeWav(norm, samples, sampleRate);
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '96000', norm, dest]);
  unlinkSync(raw); unlinkSync(norm);
  console.log(`${name}.m4a ← ${source} · ${fmt.channels}ch ${fmt.sampleRate} Hz · ganancia ×${gain.toFixed(2)} · ${(samples.length / sampleRate).toFixed(2)} s · ${(readFileSync(dest).length / 1024).toFixed(0)} KB`);
}
