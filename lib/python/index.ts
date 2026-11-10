// Public API — runPython(code) returns everything the UI needs.

import { parseProgram, Stmt } from './parser';
import { Interpreter, RunResult, RunOptions, PyValue } from './interpreter';
import { PyError } from './errors';

export type { RunResult, PyValue };

export function runPython(code: string, opts: RunOptions = {}): RunResult {
  let stmts: Stmt[];
  try {
    stmts = parseProgram(code);
  } catch (e) {
    if (e instanceof PyError) {
      return {
        ok: false, output: '', vars: {},
        error: { line: 0, friendly: e.message, emoji: e.emoji },
      };
    }
    throw e;
  }
  const i = new Interpreter(opts);
  return i.run(stmts);
}

export { parseProgram, Interpreter };
