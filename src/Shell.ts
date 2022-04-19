
// import * as path from "https://deno.land/std/path/mod.ts";
// import type {Result} from "./Process.ts";

import {run, throw_on_fail} from "./Process.ts";
import {rearrange} from "./Array.ts";
import {
  sum, map_length,
  tail_indexes, head_indexes,
  pipe_function, max
} from "./Function.ts";
import type {Slice_Spec, Arrange_Spec} from "./Array.ts";

export function cell<T>(x: T): Cell<T> {
  return new Cell(x);
} // export function

export function row<T>(x: T[]): Row<T> {
  return new Row(x);
} // export function

export function columns<T>(x: T[][]): Columns<T> {
  return new Columns(x);
} // export function

export async function run_cmd_args(cmd: string, args: string | string[]) {
  if (typeof args === "string")
    args = args.trim().split(/\s+/);
  const result = await throw_on_fail(run([cmd].concat(args), "piped", "quiet"));
  return row(result.stdout.trim().split('\n'));
} // export async

export async function fd(args: string | string[]) {
  return await run_cmd_args("fd", args);
} // export async

export async function find(args: string | string[]) {
  return await run_cmd_args("find", args);
} // export async

export class Cell<T> {
  readonly raw: T;

  constructor(x: T) {
    this.raw = x;
  }

  to_row() {
    return row([this.raw]);
  } // method

  split(sr: string | RegExp) {
    const x = this.raw;
    if (typeof x === "string")
      return row(x.split(sr));
    throw new Error(`.split only available for string: ${Deno.inspect(x)} (${typeof x} )`)
  } // method

  cut(s: string | RegExp, ...cols: Array<number | Slice_Spec>) {
    const x = this.raw;
    if (typeof x === "string")
      return this.to_row().cut(s, ...cols);
    throw new Error(`.cut only available for string: ${Deno.inspect(x)} (${typeof x} )`)
  } // method

} // export class

export class Row<T> {
  readonly raw: T[];

  constructor(l: T[]) {
    this.raw = l;
  }

  get length() { return this.raw.length; }

  cut(s: string | RegExp, ...cols: Array<number | Slice_Spec>): Columns<string> {
    const result = this.raw.reduce((prev, curr) => {
      if (typeof curr !== "string")
        throw new Error(`Only a row of strings is allowed when using Row#cut.`);
      const pieces = curr.trim().split(s);
      if (cols.length === 0)
        prev.push(pieces);
      else
        prev.push(
          rearrange(pieces, cols)
        );
      return prev;
    }, [] as Array<Array<string>>);

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
    if (c.length === 0 || c[0].length === 0)
      throw new Error(`Columns may not be empty: ${Deno.inspect(c)}`);
    this.raw = c;
  } // constructor

  get row_count() { return this.raw.length; }
  get column_count() { return max(map_length(this.raw)); }
  get cell_count() { return sum(this.raw.map(x => x.length)); }
  get area() { return this.row_count * this.column_count; }


  to_row<X>(f: (x: T[]) => X): Row<X> {
    return row(this.raw.map(r => f(r)));
  }

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
  // Arrange:
  // =============================================================================

  arrange(...spec: Arrange_Spec): Columns<T> {
    return this.rows(row => rearrange(row, spec)) ;
  } // method

  // =============================================================================
  // Head/Tail:
  // =============================================================================

  head(i: 1, t: "cell"): Cell<T> ;
  head(i: 1, t: "row"): Row<T> ;
  head(i: 1, t: "column"): Columns<T> ;
  head(i: number, t: "cell"): never ;
  head(i: number, t: "row"): Columns<T> ;
  head(i: number, t: "column"): Columns<T>;
  head(i: number, t: "cell" | "row" | "column") {
    if (i < 1)
      throw new Error(`Invalid quantity for head(${i}, ${t})`);

    switch (`${i} ${t}`) {
      case "1 cell": { return cell(this.raw[0][0]); }
      case "1 row": { return row(this.raw[0]); }
      case "1 column": { return this.arrange(0); }
    } // switch

    switch (t) {
      case "cell": {
        throw new Error(`Quantity higher than 1 is not allowed: head(${i}, cell).`);
      } // case

      case "row": {
        return columns(this.raw.slice(0, i));
      } // case

      case "column": {
        return this.arrange(...(head_indexes(this.raw[0], i)));
      } // case
    } // switch
  } // method

  tail(i: 1, t: "cell"): Cell<T> ;
  tail(i: 1, t: "row"): Row<T> ;
  tail(i: 1, t: "column"): Columns<T> ;
  tail(i: number, t: "cell"): never ;
  tail(i: number, t: "row"): Columns<T> ;
  tail(i: number, t: "column"): Columns<T>;
  tail(i: number, t: "cell" | "row" | "column") {
    if (i < 1)
      throw new Error(`Invalid quantity for tail(${i}, ${t})`);

    switch (`${i} ${t}`) {
      case "1 cell": { return cell(this.raw[this.raw.length - 1].reverse()[0]); }
      case "1 row": { return row(this.raw[this.raw.length - 1]); }
      case "1 column": { return this.arrange(0); }
    } // switch

    switch (t) {
      case "cell": {
        throw new Error(`Only 1 allowed for tail(${i}, cell)`);
      } // case

      case "row": {
        return columns(this.raw.reverse().slice(0, i).reverse());
      } // case

      case "column": {
        const col_count = this.column_count;
        if (i > col_count)
          throw new Error(`${i} columns requested, but only ${col_count} exist.`);
        return this.arrange(...(tail_indexes(this.raw[0], i)));
      } // case
    } // switch
  } // method

  // =============================================================================
  // Map:
  // =============================================================================

  cell(raw_i: "first" | "last", ...funcs: Array<(x: any) => any>) {
    const arr = this.raw;
    if (arr.length === 0 || arr[0].length === 0)
      return this;

    switch (raw_i) {
      case "first": {
        const row      = arr[0].slice();
        const old_cell = row[0];
        row[0]         = pipe_function(...funcs)(old_cell);
        return columns([row].concat(this.raw.slice(1)));
      } // case first

      case "last": {
        const row      = this.tail(1, "row").raw.slice();
        const old_cell = this.tail(1, "cell");
        row[row.length - 1] = pipe_function(...funcs)(old_cell);
        return columns(this.raw.slice(0, this.raw.length - 1).concat([row]));
      } // case last
    } // switch
  } // method

  cells(...funcs: Array<(x: any) => any>) {
    const f = pipe_function(...funcs);
    const fin: any[][] = [];
    for (const r of this.raw) {
      const new_row: any[] = [];
      for (const cell of r) {
        new_row.push(f(cell));
      } // for
      fin.push(new_row);
    } // for
    return columns(fin);
  } // method

  column(i: number, f: (x: T) => any) {
    if (i < 0)
      throw new Error(`Invalid value for column index: ${Deno.inspect(i)}`);
    const new_raw = this.raw.map(r => {
      if (i > r.length )
        return r;
      const new_row = r.slice();
      new_row[i] = f(r[i]);
      return new_row;
    });
    return columns(new_raw);
  } // method

  rows<X>(f: (x: T[]) => X[]): Columns<X> {
    return columns(
      this.raw.map(row => f(row))
    );
  } // method

} // export class
