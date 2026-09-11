export const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-./";

export const COL = {
  flt: 6,
  dest: 10,
  slot: 10,
  remarks: 9,
} as const;

export function normalizeChar(raw: string): string {
  const ch = raw.toUpperCase();
  return FLAP_CHARS.includes(ch) ? ch : " ";
}

export function padFlap(text: string, width: number): string {
  return Array.from(text.toUpperCase())
    .map((ch) => normalizeChar(ch))
    .join("")
    .slice(0, width)
    .padEnd(width, " ");
}

export function formatSlot(slot: number, width = COL.slot): string {
  if (!Number.isFinite(slot) || slot <= 0) return padFlap("", width);
  return padFlap(String(Math.trunc(slot)), width);
}

export function formatClock(date = new Date()): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function jitterDeg(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return ((h % 11) - 5) * 0.11;
}
