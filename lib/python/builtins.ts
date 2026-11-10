// Python built-in functions, kid-safe.
// Pre-injected into every program: no imports needed.

import { PyError, levenshtein, KNOWN_NAMES } from './errors';

export function pyStr(v: unknown): string {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  return String(v);
}
export function pyRepr(v: unknown): string {
  if (typeof v === 'string') return "'" + v + "'";
  return pyStr(v);
}

export function truthy(v: unknown): boolean {
  if (v === false || v === null || v === undefined || v === 0 || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

export interface CallCtx {
  out: string[];
  inputQueue: string[]; // Pre-supplied answers for input()
  onInputNeeded?: (prompt: string) => string | null;
}

export function callBuiltin(
  name: string,
  attr: string | undefined,
  args: unknown[],
  kwargs: Record<string, unknown>,
  ctx: CallCtx,
): unknown {
  // Attribute-style: random.choice(xs)
  if (attr) {
    if (name === 'random' && attr === 'choice') {
      const lst = args[0];
      if (!Array.isArray(lst) || lst.length === 0) {
        throw new PyError("random.choice needs a list with things in it!", '🎲');
      }
      return lst[Math.floor(Math.random() * lst.length)];
    }
    throw new PyError(`I don't know ${name}.${attr}() yet.`, '🤖');
  }

  switch (name) {
    case 'print': {
      const sep = typeof kwargs.sep === 'string' ? kwargs.sep : ' ';
      const end = typeof kwargs.end === 'string' ? kwargs.end : '\n';
      ctx.out.push(args.map(pyStr).join(sep) + end);
      return null;
    }
    case 'str':   return pyStr(args[0]);
    case 'int': {
      const n = parseInt(String(args[0]), 10);
      if (isNaN(n)) throw new PyError(`Can't turn '${args[0]}' into a number`, '🔢');
      return n;
    }
    case 'float': {
      const n = parseFloat(String(args[0]));
      if (isNaN(n)) throw new PyError(`Can't turn '${args[0]}' into a number`, '🔢');
      return n;
    }
    case 'len': {
      const a = args[0];
      if (typeof a === 'string' || Array.isArray(a)) return a.length;
      throw new PyError('len() needs a word or a list', '📏');
    }
    case 'abs': return Math.abs(args[0] as number);
    case 'range': {
      const arr: number[] = [];
      if (args.length === 1) {
        const n = Number(args[0]);
        for (let i = 0; i < n; i++) arr.push(i);
      } else if (args.length === 2) {
        const [a, b] = args as [number, number];
        for (let i = a; i < b; i++) arr.push(i);
      } else {
        const [a, b, step] = args as [number, number, number];
        if (step > 0) for (let i = a; i < b; i += step) arr.push(i);
        else for (let i = a; i > b; i += step) arr.push(i);
      }
      return arr;
    }
    case 'input': {
      const prompt = typeof args[0] === 'string' ? (args[0] as string) : '';
      if (ctx.inputQueue.length > 0) {
        return ctx.inputQueue.shift()!;
      }
      if (ctx.onInputNeeded) {
        const r = ctx.onInputNeeded(prompt);
        if (r === null) throw new PyError('_INPUT_NEEDED', '💬');
        return r;
      }
      throw new PyError('_INPUT_NEEDED', '💬');
    }
  }
  const close = KNOWN_NAMES.find((k) => levenshtein(k, name) <= 2);
  if (close && close !== name) {
    throw new PyError(`Did you mean ${close}()? 🤖`, '🤖');
  }
  throw new PyError(`I don't know how to do '${name}()' yet`, '🤖');
}
