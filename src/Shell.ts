
// import * as path from "https://deno.land/std/path/mod.ts";
// import type {Result} from "./Process.ts";

import {run, throw_on_fail} from "./Process.ts";
import {
  split_whitespace,
  split_lines,
} from "./String.ts";
import {rearrange} from "./Array.ts";
import type {Slice_Spec, Arrange_Spec} from "./Array.ts";


export function row<T>(x: T[]): Row<T> {
  return new Row(x);
} // export function

export function columns<T>(x: T[][]): Columns<T> {
  return new Columns(x);
} // export function

export function arrays_to_columns(...arrs: Array<any[]>) {
  const col_count = arrs.map(x => x.length).reduce((prev, curr) => {
    return (curr > prev) ? curr : prev;
  }, 0);
  const cols = [];
  for (let x = 0; x < col_count; ++x) {
    const row = [];
    for (const a of arrs) {
      if (x < a.length) {
        row.push(a[x]);
      }
    }
    cols.push(row);
  }
  return columns(cols);
} // export function

export async function run_cmd_args(cmd: string, args: string | string[]) {
  if (typeof args === "string")
    args = split_whitespace(args);
  const result = await throw_on_fail(run([cmd].concat(args), "piped", "quiet"));
  return row(split_lines(result.stdout));
} // export async

export async function fd(args: string | string[]) {
  return await run_cmd_args("fd", args);
} // export async

export async function find(args: string | string[]) {
  return await run_cmd_args("find", args);
} // export async


export class Row<T> {
  readonly raw: T[];
  // result?:      Result;

  constructor(l: T[]) {
    this.raw = l;
  }

  get length() { return this.raw.length; }

  cut(s: string | RegExp, ...cols: Array<number | Slice_Spec>) {
    // }: Columns<T[]> {
    const result = this.raw.reduce((prev, curr) => {
      if (typeof curr !== "string") {
        prev.push([curr]);
        return prev;
      }
      const pieces = curr.trim().split(s);
      if (cols.length === 0)
        prev.push(pieces);
      else
        prev.push(
          rearrange(pieces, cols)
        );
      return prev;
    }, [] as Array<Array<T | string>>);

    return columns(result);
  } // method

  map(...funcs: Function[]): Row<any> {
    return row(
      this.raw.map(
        x => funcs.reduce(
          (prev, curr) => curr(prev),
          x
        )
      )
    );
  } // method

  filter(f: (x: T) => boolean): Row<T> {
    return row(this.raw.filter(x => f(x)));
  } // method

  remove(f: (x: T) => boolean): Row<T> {
    return row(this.raw.filter(x => !f(x)));
  } // method

  promise_all() {
    return Promise.all(this.raw);
  } // method
} // class

export class Columns<T> {
  raw: T[][];

  constructor(c: T[][]) {
    this.raw = c;
  }

  get row_count() { return this.raw.length; }
  get column_count() { return this.raw.reduce((max, row) => { return (row.length < max) ? max : row.length; }, 0); }
  get cell_count() { return this.raw.reduce((prev, curr) => { return prev + curr.length; }, 0); }
  get area() { return this.row_count * this.column_count; }

  arrange(...spec: Arrange_Spec): Columns<T> {
    return this.map_rows(row => rearrange(row, spec)) ;
  } // method

  // =============================================================================
  // Filter:
  // =============================================================================

  filter_cells(f: (x: T) => boolean): Columns<T> {
    return columns(
      this.raw.map(
        row => row.filter(c => f(c))
      )
    );
  } // method

  filter_rows(f: (x: T[]) => boolean): Columns<T> {
    return columns(
      this.raw.filter(row => f(row))
    );
  } // method

  // =============================================================================
  // Remove:
  // =============================================================================

  remove_cells(f: (x: T) => boolean): Columns<T> {
    return this.filter_cells(x => !f(x));
  } // method

  remove_rows(f: (x: T[]) => boolean): Columns<T> {
    return this.filter_rows(x => !f(x));
  } // method

  // =============================================================================
  // Map:
  // =============================================================================

  map_cells<X>(f: (x: T) => X): Columns<X> {
    return columns(
      this.raw.map(
        row => row.map(c => f(c))
      )
    );
  } // method

  map_rows<X>(f: (x: T[]) => X[]): Columns<X> {
    return columns(
      this.raw.map(row => f(row))
    );
  } // method

} // export class
