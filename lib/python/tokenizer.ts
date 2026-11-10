// Python tokenizer — single-line, used by parser line-by-line.
// No eval, no new Function. CSP-safe.

export type Tok =
  | { t: 'NUM'; v: number }
  | { t: 'STR'; v: string }
  | { t: 'NAME'; v: string }
  | { t: 'OP'; v: string }
  | { t: 'CMP'; v: string }
  | { t: 'LP' }
  | { t: 'RP' }
  | { t: 'LBR' }
  | { t: 'RBR' }
  | { t: 'COMMA' }
  | { t: 'COLON' }
  | { t: 'DOT' }
  | { t: 'EQ' }
  | { t: 'EOF' };

export class PyLexError extends Error {
  constructor(public msg: string, public col: number) {
    super(msg);
  }
}

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && (src[i] === ' ' || src[i] === '\t')) i++;
    if (i >= src.length) break;
    const c = src[i];

    // Numbers
    if (/\d/.test(c)) {
      let n = '';
      while (i < src.length && /[\d.]/.test(src[i])) n += src[i++];
      const val = n.includes('.') ? parseFloat(n) : parseInt(n, 10);
      out.push({ t: 'NUM', v: val });
      continue;
    }

    // Strings
    if (c === '"' || c === "'") {
      const q = c;
      const startCol = i;
      i++;
      let s = '';
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\' && i + 1 < src.length) {
          const nx = src[i + 1];
          if (nx === 'n') s += '\n';
          else if (nx === 't') s += '\t';
          else if (nx === '\\') s += '\\';
          else if (nx === q) s += q;
          else if (nx === '"') s += '"';
          else if (nx === "'") s += "'";
          else s += nx;
          i += 2;
        } else {
          s += src[i++];
        }
      }
      if (i >= src.length) {
        throw new PyLexError(
          `Oops! A ${q} is missing its partner. Check your quotes! 🔍`,
          startCol,
        );
      }
      i++;
      out.push({ t: 'STR', v: s });
      continue;
    }

    // Identifiers / keywords (tokenized as NAME; parser decides semantics)
    if (/[a-zA-Z_]/.test(c)) {
      let n = '';
      while (i < src.length && /[a-zA-Z_0-9]/.test(src[i])) n += src[i++];
      out.push({ t: 'NAME', v: n });
      continue;
    }

    // Two-char operators
    if (c === '=' && src[i + 1] === '=') { out.push({ t: 'CMP', v: '==' }); i += 2; continue; }
    if (c === '!' && src[i + 1] === '=') { out.push({ t: 'CMP', v: '!=' }); i += 2; continue; }
    if (c === '<' && src[i + 1] === '=') { out.push({ t: 'CMP', v: '<=' }); i += 2; continue; }
    if (c === '>' && src[i + 1] === '=') { out.push({ t: 'CMP', v: '>=' }); i += 2; continue; }
    if (c === '/' && src[i + 1] === '/') { out.push({ t: 'OP', v: '//' }); i += 2; continue; }

    // Single-char
    if (c === '(')  { out.push({ t: 'LP'    }); i++; continue; }
    if (c === ')')  { out.push({ t: 'RP'    }); i++; continue; }
    if (c === '[')  { out.push({ t: 'LBR'   }); i++; continue; }
    if (c === ']')  { out.push({ t: 'RBR'   }); i++; continue; }
    if (c === ',')  { out.push({ t: 'COMMA' }); i++; continue; }
    if (c === ':')  { out.push({ t: 'COLON' }); i++; continue; }
    if (c === '.')  { out.push({ t: 'DOT'   }); i++; continue; }
    if (c === '=')  { out.push({ t: 'EQ'    }); i++; continue; }
    if (c === '<')  { out.push({ t: 'CMP', v: '<' }); i++; continue; }
    if (c === '>')  { out.push({ t: 'CMP', v: '>' }); i++; continue; }
    if ('+-*/%'.indexOf(c) !== -1) { out.push({ t: 'OP', v: c }); i++; continue; }

    throw new PyLexError(`I don't understand this symbol: ${c}`, i);
  }
  out.push({ t: 'EOF' });
  return out;
}

export function stripComment(line: string): string {
  let inStr: string | null = null;
  let o = '';
  for (let k = 0; k < line.length; k++) {
    const ch = line[k];
    if (inStr) {
      o += ch;
      if (ch === '\\' && k + 1 < line.length) { o += line[++k]; continue; }
      if (ch === inStr) inStr = null;
    } else {
      if (ch === '#') break;
      if (ch === '"' || ch === "'") inStr = ch;
      o += ch;
    }
  }
  return o;
}

export function getIndent(s: string): number {
  const m = s.match(/^ */);
  return m ? m[0].length : 0;
}
