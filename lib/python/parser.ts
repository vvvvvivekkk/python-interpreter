// AST + recursive-descent parser for a Python subset.
// Grammar covers: print, variables, arithmetic, strings, lists,
// if/elif/else, for x in ..., def, return, comparisons, and calls.

import { tokenize, stripComment, getIndent, Tok, PyLexError } from './tokenizer';
import { PyError } from './errors';

// ─── AST node types ──────────────────────────────────────────

export type Expr =
  | { type: 'Num'; value: number }
  | { type: 'Str'; value: string }
  | { type: 'Bool'; value: boolean }
  | { type: 'None' }
  | { type: 'Name'; name: string }
  | { type: 'List'; items: Expr[] }
  | { type: 'Index'; target: Expr; idx: Expr }
  | { type: 'BinOp'; op: string; left: Expr; right: Expr }
  | { type: 'Unary'; op: string; arg: Expr }
  | { type: 'Compare'; op: string; left: Expr; right: Expr }
  | { type: 'Call'; name: string; args: Expr[]; kwargs: Record<string, Expr>; attr?: string };

export type Stmt =
  | { type: 'Expr'; expr: Expr; line: number }
  | { type: 'Assign'; target: string; value: Expr; line: number }
  | { type: 'If'; cond: Expr; body: Stmt[]; elifs: { cond: Expr; body: Stmt[] }[]; elseBody?: Stmt[]; line: number }
  | { type: 'For'; varName: string; iter: Expr; body: Stmt[]; line: number }
  | { type: 'While'; cond: Expr; body: Stmt[]; line: number }
  | { type: 'Def'; name: string; params: string[]; body: Stmt[]; line: number }
  | { type: 'Return'; value: Expr | null; line: number };

// ─── Expression parser (single line of tokens) ────────────────

class ExprParser {
  private i = 0;
  constructor(private t: Tok[]) {}

  peek(off = 0): Tok { return this.t[this.i + off] ?? { t: 'EOF' }; }
  eat<T extends Tok['t']>(type: T): Tok {
    if (this.peek().t !== type) {
      if (type === 'RP') throw new PyError('Did you forget the ) at the end?', '🔍');
      if (type === 'RBR') throw new PyError('Did you forget the ] at the end?', '🔍');
      throw new PyError(`I was expecting something different here.`, '🧩');
    }
    return this.t[this.i++];
  }
  done(): boolean { return this.peek().t === 'EOF'; }

  parseTop(): Expr { return this.parseCompare(); }

  parseCompare(): Expr {
    let left = this.parseAddSub();
    if (this.peek().t === 'CMP') {
      const op = (this.eat('CMP') as { t: 'CMP'; v: string }).v;
      const right = this.parseAddSub();
      return { type: 'Compare', op, left, right };
    }
    return left;
  }
  parseAddSub(): Expr {
    let left = this.parseMulDiv();
    while (this.peek().t === 'OP' && (this.peekOp() === '+' || this.peekOp() === '-')) {
      const op = (this.eat('OP') as { t: 'OP'; v: string }).v;
      const right = this.parseMulDiv();
      left = { type: 'BinOp', op, left, right };
    }
    return left;
  }
  parseMulDiv(): Expr {
    let left = this.parseUnary();
    while (this.peek().t === 'OP' && ['*', '/', '%', '//'].includes(this.peekOp()!)) {
      const op = (this.eat('OP') as { t: 'OP'; v: string }).v;
      const right = this.parseUnary();
      left = { type: 'BinOp', op, left, right };
    }
    return left;
  }
  parseUnary(): Expr {
    if (this.peek().t === 'OP' && this.peekOp() === '-') {
      this.eat('OP');
      return { type: 'Unary', op: '-', arg: this.parseUnary() };
    }
    return this.parsePostfix();
  }
  parsePostfix(): Expr {
    let node = this.parsePrimary();
    while (true) {
      if (this.peek().t === 'LBR') {
        this.eat('LBR');
        const idx = this.parseCompare();
        this.eat('RBR');
        node = { type: 'Index', target: node, idx };
      } else if (this.peek().t === 'DOT') {
        // Attribute call: only random.choice supported for now.
        this.eat('DOT');
        const attr = (this.eat('NAME') as { t: 'NAME'; v: string }).v;
        this.eat('LP');
        const { args, kwargs } = this.parseArgs();
        this.eat('RP');
        if (node.type !== 'Name') {
          throw new PyError("Only simple things can use the dot like that.", '🧩');
        }
        node = { type: 'Call', name: node.name, attr, args, kwargs };
      } else {
        break;
      }
    }
    return node;
  }
  parsePrimary(): Expr {
    const tok = this.peek();
    if (tok.t === 'NUM') { this.i++; return { type: 'Num', value: tok.v }; }
    if (tok.t === 'STR') { this.i++; return { type: 'Str', value: tok.v }; }
    if (tok.t === 'LP') {
      this.eat('LP');
      const e = this.parseCompare();
      this.eat('RP');
      return e;
    }
    if (tok.t === 'LBR') {
      this.eat('LBR');
      const items: Expr[] = [];
      if (this.peek().t !== 'RBR') {
        while (true) {
          items.push(this.parseCompare());
          if (this.peek().t === 'COMMA') this.eat('COMMA');
          else break;
        }
      }
      this.eat('RBR');
      return { type: 'List', items };
    }
    if (tok.t === 'NAME') {
      const name = (this.eat('NAME') as { t: 'NAME'; v: string }).v;
      if (name === 'True')  return { type: 'Bool', value: true };
      if (name === 'False') return { type: 'Bool', value: false };
      if (name === 'None')  return { type: 'None' };
      if (this.peek().t === 'LP') {
        this.eat('LP');
        const { args, kwargs } = this.parseArgs();
        this.eat('RP');
        return { type: 'Call', name, args, kwargs };
      }
      return { type: 'Name', name };
    }
    throw new PyError(`I don't understand here.`, '🧩');
  }
  parseArgs(): { args: Expr[]; kwargs: Record<string, Expr> } {
    const args: Expr[] = [];
    const kwargs: Record<string, Expr> = {};
    if (this.peek().t === 'RP') return { args, kwargs };
    while (true) {
      if (this.peek().t === 'NAME' && this.peek(1).t === 'EQ') {
        const k = (this.eat('NAME') as { t: 'NAME'; v: string }).v;
        this.eat('EQ');
        kwargs[k] = this.parseCompare();
      } else {
        args.push(this.parseCompare());
      }
      if (this.peek().t === 'COMMA') this.eat('COMMA');
      else break;
    }
    return { args, kwargs };
  }
  peekOp(): string | undefined {
    const t = this.peek();
    return t.t === 'OP' ? t.v : undefined;
  }
}

export function parseExprLine(line: string): Expr {
  const toks = tokenize(line);
  const p = new ExprParser(toks);
  return p.parseTop();
}

// ─── Statement parser (block-aware, uses indentation) ────────

function parseExprStatementOrAssign(content: string, line: number): Stmt {
  const toks = tokenize(content);
  // Detect assignment: NAME EQ ...
  if (toks.length >= 2 && toks[0].t === 'NAME' && toks[1].t === 'EQ') {
    const target = (toks[0] as { t: 'NAME'; v: string }).v;
    const rhs = toks.slice(2);
    const p = new ExprParser(rhs);
    const value = p.parseTop();
    return { type: 'Assign', target, value, line };
  }
  const p = new ExprParser(toks);
  const expr = p.parseTop();
  return { type: 'Expr', expr, line };
}

function parseDefHeader(content: string): { name: string; params: string[] } {
  // "def name(a, b):"
  const m = content.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
  if (!m) throw new PyError(`A function needs 'def name():' with the : at the end!`, '🧩');
  const params = m[2].split(',').map((s) => s.trim()).filter(Boolean);
  return { name: m[1], params };
}

function stripCompound(content: string, keyword: string): string {
  // Returns the "condition" part of an `if cond:` or similar.
  // Strips the leading keyword and trailing colon.
  return content.slice(keyword.length, -1).trim();
}

export function parseBlock(
  lines: string[],
  startIdx: number,
  baseIndent: number,
): { stmts: Stmt[]; next: number } {
  const stmts: Stmt[] = [];
  let i = startIdx;
  while (i < lines.length) {
    const raw = stripComment(lines[i]);
    const content = raw.trim();
    if (!content) { i++; continue; }
    const ind = getIndent(raw);
    if (ind < baseIndent) break;
    if (ind > baseIndent) {
      throw new PyError(
        `Line ${i + 1}: the indent looks wrong — the inside of the block should line up.`,
        '👉',
      );
    }

    // Compound: if / for / def / while
    if (/^if\b/.test(content)) {
      if (!content.endsWith(':')) throw new PyError(`Oops! The computer needs a : after if. Try again! 🧩`, '🧩');
      const cond = parseExprLine(stripCompound(content, 'if'));
      const inner = parseBlock(lines, i + 1, baseIndent + 4);
      const node: Stmt = { type: 'If', cond, body: inner.stmts, elifs: [], line: i + 1 };
      i = inner.next;
      // elif / else
      while (i < lines.length) {
        const r2 = stripComment(lines[i]);
        const t2 = r2.trim();
        if (!t2) { i++; continue; }
        if (getIndent(r2) !== baseIndent) break;
        if (/^elif\b/.test(t2)) {
          if (!t2.endsWith(':')) throw new PyError(`Oops! The computer needs a : after elif. 🧩`, '🧩');
          const ec = parseExprLine(stripCompound(t2, 'elif'));
          const inner2 = parseBlock(lines, i + 1, baseIndent + 4);
          node.elifs.push({ cond: ec, body: inner2.stmts });
          i = inner2.next;
        } else if (t2 === 'else:') {
          const inner3 = parseBlock(lines, i + 1, baseIndent + 4);
          node.elseBody = inner3.stmts;
          i = inner3.next;
          break;
        } else break;
      }
      stmts.push(node);
      continue;
    }

    if (/^for\s+\w+\s+in\s+.+:$/.test(content)) {
      const m = content.match(/^for\s+(\w+)\s+in\s+(.+):$/)!;
      const iter = parseExprLine(m[2]);
      const inner = parseBlock(lines, i + 1, baseIndent + 4);
      stmts.push({ type: 'For', varName: m[1], iter, body: inner.stmts, line: i + 1 });
      i = inner.next;
      continue;
    }

    if (/^while\s+.+:$/.test(content)) {
      const cond = parseExprLine(content.slice(5, -1).trim());
      const inner = parseBlock(lines, i + 1, baseIndent + 4);
      stmts.push({ type: 'While', cond, body: inner.stmts, line: i + 1 });
      i = inner.next;
      continue;
    }

    if (/^def\b/.test(content)) {
      const { name, params } = parseDefHeader(content);
      const inner = parseBlock(lines, i + 1, baseIndent + 4);
      stmts.push({ type: 'Def', name, params, body: inner.stmts, line: i + 1 });
      i = inner.next;
      continue;
    }

    if (/^return\b/.test(content)) {
      const after = content.slice(6).trim();
      const value = after ? parseExprLine(after) : null;
      stmts.push({ type: 'Return', value, line: i + 1 });
      i++;
      continue;
    }

    // Catch "if ..." without colon, etc.
    if (/^(if|elif|for|while|def|else)\b/.test(content) && !content.endsWith(':')) {
      throw new PyError(`Line ${i + 1}: don't forget the : at the end!`, '🧩');
    }

    stmts.push(parseExprStatementOrAssign(content, i + 1));
    i++;
  }
  return { stmts, next: i };
}

export function parseProgram(src: string): Stmt[] {
  try {
    const lines = src.split('\n');
    const { stmts } = parseBlock(lines, 0, 0);
    return stmts;
  } catch (e) {
    if (e instanceof PyLexError) {
      throw new PyError(e.msg, '🔍');
    }
    throw e;
  }
}
