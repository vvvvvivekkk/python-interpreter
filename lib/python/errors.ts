// Kid-friendly error wrapping. Every runtime/parse error becomes a FriendlyError.

export interface FriendlyError {
  line: number;
  friendly: string;
  hint?: string;
  emoji: string;
}

export class PyError extends Error {
  constructor(public friendly: string, public emoji = '🧩', public hint?: string) {
    super(friendly);
  }
}

export function levenshtein(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= a.length; i++) m[i] = [i];
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] =
        a[i - 1] === b[j - 1]
          ? m[i - 1][j - 1]
          : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]);
    }
  }
  return m[a.length][b.length];
}

export const KNOWN_NAMES = [
  'print', 'input', 'str', 'int', 'float', 'len', 'abs',
  'range', 'True', 'False', 'None', 'random',
];

export function makeNameError(name: string): PyError {
  const close = KNOWN_NAMES.find((k) => k !== name && levenshtein(k, name) <= 2);
  if (close) {
    return new PyError(`Did you mean ${close}()? 🤖`, '🤖');
  }
  return new PyError(
    `I don't know '${name}'. Did you forget the quotes? Like "${name}" 💬`,
    '💬',
  );
}
