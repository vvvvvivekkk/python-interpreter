// AST-inspection helpers for the Missions page.
// Each mission inspects the parsed program (not just output text).

import { Expr, Stmt, parseProgram } from './parser';
import { RunResult } from './interpreter';

function walk(node: Stmt | Expr, visit: (n: Stmt | Expr) => void): void {
  visit(node);
  const n = node as { [k: string]: unknown };
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item && typeof item === 'object' && 'type' in item) walk(item as Stmt | Expr, visit);
      }
    } else if (v && typeof v === 'object' && 'type' in v) {
      walk(v as Stmt | Expr, visit);
    }
  }
}

function collect<T extends Stmt | Expr>(stmts: Stmt[], typeName: string): T[] {
  const out: T[] = [];
  for (const s of stmts) walk(s, (n) => { if (n.type === typeName) out.push(n as T); });
  return out;
}

function hasPrintWith(stmts: Stmt[], check: (args: Expr[]) => boolean): boolean {
  const calls = collect<Expr & { type: 'Call' }>(stmts, 'Call');
  return calls.some((c) => c.name === 'print' && check(c.args));
}

export interface MissionCheck {
  (code: string, result: RunResult, childName: string): boolean;
}

export const MISSION_CHECKS: Record<string, MissionCheck> = {
  'say-hello': (code) => {
    try {
      const stmts = parseProgram(code);
      return hasPrintWith(stmts, (args) =>
        args.some((a) => a.type === 'Str' && /hello|hi\b|hey/i.test(a.value)),
      );
    } catch { return false; }
  },
  'say-name': (code, _r, childName) => {
    try {
      const stmts = parseProgram(code);
      const target = (childName || '').toLowerCase();
      return hasPrintWith(stmts, (args) =>
        args.some((a) =>
          a.type === 'Str' && (target ? a.value.toLowerCase().includes(target) : a.value.trim().length > 0),
        ),
      );
    } catch { return false; }
  },
  'print-age': (code, _r, _n) => {
    try {
      const stmts = parseProgram(code);
      return hasPrintWith(stmts, (args) =>
        args.some((a) => a.type === 'Num' && Number.isInteger(a.value) && a.value >= 1 && a.value <= 120),
      );
    } catch { return false; }
  },
  'hero-power-boxes': (code, _r, _n) => {
    try {
      const stmts = parseProgram(code);
      const assigns = collect<Stmt & { type: 'Assign' }>(stmts, 'Assign');
      const hasHero = assigns.some((a) => a.target === 'hero');
      const hasPower = assigns.some((a) => a.target === 'power');
      return hasHero && hasPower;
    } catch { return false; }
  },
  'join-boxes': (code) => {
    try {
      const stmts = parseProgram(code);
      // Find a print call whose args contain a BinOp(+) over two Name nodes
      const calls = collect<Expr & { type: 'Call' }>(stmts, 'Call');
      return calls.some(
        (c) =>
          c.name === 'print' &&
          c.args.some(
            (a) => a.type === 'BinOp' && a.op === '+' && a.left.type === 'Name' && a.right.type === 'Name',
          ),
      );
    } catch { return false; }
  },
  'if-win': (code) => {
    try {
      const stmts = parseProgram(code);
      const ifs = collect<Stmt & { type: 'If' }>(stmts, 'If');
      return ifs.some((i) =>
        i.body.some(
          (b) =>
            b.type === 'Expr' &&
            b.expr.type === 'Call' &&
            b.expr.name === 'print' &&
            b.expr.args.some((a) => a.type === 'Str' && /win/i.test(a.value)),
        ),
      );
    } catch { return false; }
  },
  'loop-print-3': (code, _r) => {
    try {
      const stmts = parseProgram(code);
      const fors = collect<Stmt & { type: 'For' }>(stmts, 'For');
      return fors.some((f) =>
        f.body.some((b) => b.type === 'Expr' && b.expr.type === 'Call' && b.expr.name === 'print'),
      );
    } catch { return false; }
  },
  'list-animals': (code) => {
    try {
      const stmts = parseProgram(code);
      const assigns = collect<Stmt & { type: 'Assign' }>(stmts, 'Assign');
      const hasList = assigns.some((a) => a.value.type === 'List' && a.value.items.length >= 3);
      const hasIndex = collect<Expr & { type: 'Index' }>(stmts, 'Index').length > 0;
      return hasList && hasIndex;
    } catch { return false; }
  },
  'input-greet': (code) => {
    try {
      const stmts = parseProgram(code);
      const calls = collect<Expr & { type: 'Call' }>(stmts, 'Call');
      const usesInput = calls.some((c) => c.name === 'input');
      const usesPrint = calls.some((c) => c.name === 'print');
      return usesInput && usesPrint;
    } catch { return false; }
  },
  'def-twice': (code) => {
    try {
      const stmts = parseProgram(code);
      const defs = collect<Stmt & { type: 'Def' }>(stmts, 'Def');
      if (defs.length === 0) return false;
      const names = new Set(defs.map((d) => d.name));
      const calls = collect<Expr & { type: 'Call' }>(stmts, 'Call').filter((c) => names.has(c.name));
      return calls.length >= 2;
    } catch { return false; }
  },
};

export function checkMission(id: string, code: string, result: RunResult, childName: string): boolean {
  const fn = MISSION_CHECKS[id];
  if (!fn) return false;
  return fn(code, result, childName);
}
