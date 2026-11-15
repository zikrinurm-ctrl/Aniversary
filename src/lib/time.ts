// Fixed UTC timestamps anchored explicitly to Asia/Jayapura (UTC+09:00)
export const RELATIONSHIP_START_MS = Date.parse('2025-11-20T00:00:00+09:00');
export const ANNIVERSARY_TARGET_MS = Date.parse('2026-11-20T00:00:00+09:00');
export const WIT_TIMEZONE = 'Asia/Jayapura';

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMsRemaining: number;
  isAnniversaryReached: boolean;
}

export interface RelationshipDuration {
  totalDays: number;
  monthsApprox: number;
  remainingDays: number;
  hours: number;
  minutes: number;
}

export function getCountdownBreakdown(nowMs: number = Date.now()): CountdownBreakdown {
  const diff = ANNIVERSARY_TARGET_MS - nowMs;
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMsRemaining: 0,
      isAnniversaryReached: true,
    };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMsRemaining: diff,
    isAnniversaryReached: false,
  };
}

export function getRelationshipDuration(nowMs: number = Date.now()): RelationshipDuration {
  const elapsed = Math.max(0, nowMs - RELATIONSHIP_START_MS);
  const totalMinutes = Math.floor(elapsed / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const monthsApprox = Math.floor(totalDays / 30.4375);
  const remainingDays = Math.max(0, Math.floor(totalDays - monthsApprox * 30.4375));
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  return {
    totalDays,
    monthsApprox,
    remainingDays,
    hours,
    minutes,
  };
}

export function formatWitTime(nowMs: number = Date.now()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: WIT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date(nowMs))
    .replace(/\./g, ':');
}

export function formatWitDate(nowMs: number = Date.now()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: WIT_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(nowMs));
}

export function getWitGreeting(nowMs: number = Date.now()): string {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: WIT_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(new Date(nowMs));
  const hour = Number(hourStr) % 24;
  if (hour >= 4 && hour < 11) return 'Selamat pagi, kesayanganku';
  if (hour >= 11 && hour < 15) return 'Selamat siang, sayangku';
  if (hour >= 15 && hour < 18) return 'Selamat sore, rumah terhangatku';
  return 'Selamat malam, orang favoritku';
}

export async function sha256Hex(input: string): Promise<string> {
  const normalized = input.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match?.[1]) return match[1];
  }
  return null;
}
