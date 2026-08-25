export const AVATAR_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const AVATAR_COLORS = [
  "#273bf1",
  "#f02d2d",
  "#14b8a6",
  "#1bd43a",
  "#e98c13",
  "#facc15",
  "#ec4899",
  "#a523e0",
];

export const DEFAULT_AVATAR_LETTER = "A";
export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0];

export function isValidAvatar(letter, color) {
  return AVATAR_LETTERS.includes(letter) && AVATAR_COLORS.includes(color);
}