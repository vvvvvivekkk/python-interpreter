// Tree-walking interpreter — executes the AST.
// Uses JS primitives for runtime values.

import { Expr, Stmt } from './parser';
import { PyError } from './errors';
import { callBuiltin, pyStr, truthy, CallCtx } from './builtins';

// A user-defined function
interface PyFunc { type: '__pyfunc__'; params: string[]; body: Stmt[] }
export type PyValue = number | string | boolean | null | unknown[] | PyFunc;

export interface RunResult {
  ok: boolean;
  output: string;
  vars: Record<string, PyValue>;
  error?: { line: number; friendly: string; emoji: string };
  needsInput?: { prompt: string };
}

export interface RunOptions {
  // Pre-supplied answers to input() calls, in order
  inputs?: string[];
}

class ReturnSignal extends Error {
  constructor(public value: PyValue) { super(); }
}

export class Interpreter {
  private out: string[] = [];
  private inputQueue: string[];
  private pendingInputPrompt: string | null = null;
  // Scope chain: global at [0], function scopes pushed on
  private scopes: Record<string, PyValue>[] = [{}];

  constructor(opts: RunOptions = {}) {
    this.inputQueue = [...(opts.inputs ?? [])];
  }

  private topVars(): Record<string, PyValue> { return this.scopes[this.scopes.length - 1]; }
  private lookup(name: string): PyValue | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (name in this.scopes[i]) return this.scopes[i][name];
    }
    return undefined;
  }
  private assign(name: string, v: PyValue) {
    this.topVars()[name] = v;
  }

  getGlobals(): Record<string, PyValue> { return this.scopes[0]; }
  getOutput(): string { return this.out.join(''); }
  getPendingInput(): string | null { return this.pendingInputPrompt; }

  evalExpr(e: Expr): PyValue {
    switch (e.type) {
      case 'Num':  return e.value;
      case 'Str':  return e.value;
      case 'Bool': return e.value;
      case 'None': return null;
      case 'Name': {
        const v = this.lookup(e.name);
        if (v === undefined) {
          const { makeNameError } = require('./errors');
          throw makeNameError(e.name);
        }
        return v;
      }
      case 'List':
        return e.items.map((x) => this.evalExpr(x));
      case 'Index': {
        const target = this.evalExpr(e.target);
        const idx = this.evalExpr(e.idx);
        if (typeof idx !== 'number') throw new PyError('List spots are numbers, like 0 or 1.', '🔢');
        if (typeof target === 'string' || Array.isArray(target)) {
          const i = idx < 0 ? target.length + idx : idx;
          if (i < 0 || i >= target.length) {
            throw new PyError(`Spot ${idx} is outside the list!`, '🔍');
          }
          return (target as (string | unknown[]))[i] as PyValue;
        }
        throw new PyError("Only lists and words have spots you can look inside.", '🧩');
      }
      case 'Unary': {
        const v = this.evalExpr(e.arg);
        if (e.op === '-') return -(v as number);
        return v;
      }
      case 'Compare': {
        const L = this.evalExpr(e.left);
        const R = this.evalExpr(e.right);
        switch (e.op) {
          case '==': return (L as unknown) === (R as unknown);
          case '!=': return (L as unknown) !== (R as unknown);
          case '<':  return (L as number) < (R as number);
          case '>':  return (L as number) > (R as number);
          case '<=': return (L as number) <= (R as number);
          case '>=': return (L as number) >= (R as number);
        }
        return false;
      }
      case 'BinOp': {
        const L = this.evalExpr(e.left);
        const R = this.evalExpr(e.right);
        return this.doBinOp(e.op, L, R);
      }
      case 'Call': {
        const args = e.args.map((a) => this.evalExpr(a));
        const kwargs: Record<string, PyValue> = {};
        for (const k of Object.keys(e.kwargs)) kwargs[k] = this.evalExpr(e.kwargs[k]);

        // User function?
        if (!e.attr) {
          const fn = this.lookup(e.name);
          if (fn && typeof fn === 'object' && fn !== null && (fn as PyFunc).type === '__pyfunc__') {
            return this.callUserFunc(fn as PyFunc, args, e.name);
          }
        }
        const ctx: CallCtx = {
          out: this.out,
          inputQueue: this.inputQueue,
          onInputNeeded: (prompt) => {
            this.pendingInputPrompt = prompt;
            return null;
          },
        };
        return callBuiltin(e.name, e.attr, args as unknown[], kwargs as Record<string, unknown>, ctx) as PyValue;
      }
    }
  }

  private doBinOp(op: string, L: PyValue, R: PyValue): PyValue {
    if (op === '+') {
      if (Array.isArray(L) && Array.isArray(R)) return [...L, ...R];
      if (typeof L === 'string' && typeof R === 'string') return L + R;
      if (typeof L === 'number' && typeof R === 'number') return L + R;
      throw new PyError(
        `A word-${pyStr(L)} and a number-${pyStr(R)} are different. Try str(${pyStr(R)}) or just numbers!`,
        '🧩',
      );
    }
    if (op === '-') return (L as number) - (R as number);
    if (op === '*') {
      if (typeof L === 'string' && typeof R === 'number') return L.repeat(Math.max(0, R | 0));
      if (typeof R === 'string' && typeof L === 'number') return R.repeat(Math.max(0, L | 0));
      return (L as number) * (R as number);
    }
    if (op === '/') {
      if ((R as number) === 0) throw new PyError("Can't divide by zero!", '🔢');
      return (L as number) / (R as number);
    }
    if (op === '//') {
      if ((R as number) === 0) throw new PyError("Can't divide by zero!", '🔢');
      return Math.floor((L as number) / (R as number));
    }
    if (op === '%') return (L as number) % (R as number);
    throw new PyError(`Unknown operator ${op}`, '🧩');
  }

  private callUserFunc(fn: PyFunc, args: PyValue[], _name: string): PyValue {
    const scope: Record<string, PyValue> = {};
    fn.params.forEach((p, i) => { scope[p] = args[i] ?? null; });
    this.scopes.push(scope);
    try {
      this.execBlock(fn.body);
    } catch (e) {
      if (e instanceof ReturnSignal) {
        this.scopes.pop();
        return e.value;
      }
      this.scopes.pop();
      throw e;
    }
    this.scopes.pop();
    return null;
  }

  execBlock(stmts: Stmt[]): void {
    for (const s of stmts) {
      this.execStmt(s);
      if (this.pendingInputPrompt !== null) return; // suspend
    }
  }

  execStmt(s: Stmt): void {
    switch (s.type) {
      case 'Expr':
        this.evalExpr(s.expr);
        return;
      case 'Assign':
        this.assign(s.target, this.evalExpr(s.value));
        return;
      case 'If': {
        if (truthy(this.evalExpr(s.cond))) {
          this.execBlock(s.body);
        } else {
          let matched = false;
          for (const el of s.elifs) {
            if (truthy(this.evalExpr(el.cond))) {
              this.execBlock(el.body);
              matched = true;
              break;
            }
          }
          if (!matched && s.elseBody) this.execBlock(s.elseBody);
        }
        return;
      }
      case 'For': {
        const v = this.evalExpr(s.iter);
        let items: unknown[];
        if (Array.isArray(v)) items = v;
        else if (typeof v === 'string') items = v.split('');
        else throw new PyError("Can't go through that — try a list or range!", '🔁');
        for (const item of items) {
          this.assign(s.varName, item as PyValue);
          this.execBlock(s.body);
        }
        return;
      }
      case 'While': {
        let guard = 0;
        while (truthy(this.evalExpr(s.cond))) {
          this.execBlock(s.body);
          if (++guard > 10000) throw new PyError('The while loop ran too many times!', '🔁');
        }
        return;
      }
      case 'Def': {
        const fn: PyFunc = { type: '__pyfunc__', params: s.params, body: s.body };
        this.assign(s.name, fn);
        return;
      }
      case 'Return':
        throw new ReturnSignal(s.value ? this.evalExpr(s.value) : null);
    }
  }

  run(stmts: Stmt[]): RunResult {
    try {
      this.execBlock(stmts);
    } catch (e) {
      if (e instanceof PyError) {
        if (e.message === '_INPUT_NEEDED') {
          return {
            ok: false,
            output: this.out.join(''),
            vars: this.getGlobals(),
            needsInput: { prompt: this.pendingInputPrompt ?? '' },
          };
        }
        return {
          ok: false,
          output: this.out.join(''),
          vars: this.getGlobals(),
          error: { line: 0, friendly: e.message, emoji: e.emoji },
        };
      }
      throw e;
    }
    if (this.pendingInputPrompt !== null) {
      return {
        ok: false,
        output: this.out.join(''),
        vars: this.getGlobals(),
        needsInput: { prompt: this.pendingInputPrompt },
      };
    }
    return { ok: true, output: this.out.join(''), vars: this.getGlobals() };
  }
}
