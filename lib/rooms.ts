// Shared types + small helpers for the Study Rooms multiplayer feature.
// Kept separate from the page components so both the create/join page and
// the in-room page can import the same shapes.

export type RoomLevel = "schoolchild" | "student" | "professional";
export type RoomStatus = "lobby" | "in_round" | "round_results" | "finished";
export type RoundStatus = "active" | "scored";

export type Room = {
  id: string;
  code: string;
  host_user_id: string;
  subject: string;
  topic: string;
  level: RoomLevel;
  grade: number | null; // only meaningful when level === "schoolchild"
  lang: "en" | "ru" | "tg";
  total_rounds: number;
  seconds_per_round: number;
  current_round: number;
  status: RoomStatus;
  created_at: string;
};

export type RoomParticipant = {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  total_score: number;
  joined_at: string;
};

export type RoomRound = {
  id: string;
  room_id: string;
  round_number: number;
  question: string;
  started_at: string;
  ends_at: string;
  status: RoundStatus;
};

export type RoomAnswer = {
  id: string;
  room_id: string;
  room_round_id: string;
  participant_id: string;
  user_id: string;
  explanation: string;
  score: number | null;
  summary: string | null;
  mistakes: unknown;
  recommendations: unknown;
  submitted_at: string;
};

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read aloud

export function generateRoomCode(length = 5): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const ROUND_TIME_PRESETS = [60, 90, 120, 180, 300] as const;
export const ROUND_COUNT_PRESETS = [1, 3, 5, 8] as const;
export const SCHOOL_GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
