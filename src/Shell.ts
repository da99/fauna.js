
// import * as path from "https://deno.land/std/path/mod.ts";
// import type {Result} from "./Process.ts";

import {run, throw_on_fail} from "./Process.ts";
import {rearrange} from "./Array.ts";
import {
  sum, map_length, count,
  pipe_function, max,
  is_length_0, is_any,
  count_up_to, tail_count
} from "./Function.ts";
import type {Arrange_Spec} from "./Array.ts";

export async function shell(cmd: string, args: string | string[]) {
  if (typeof args === "string")
    args = args.trim().split(/\s+/);
  const result = await throw_on_fail(run([cmd].concat(args), "piped", "quiet"));
  return lines(result.stdout);
} // export async

export async function fd(args: string | string[]) {
  return await shell("fd", args);
} // export async

export async function find(args: string | string[]) {
  return await shell("find", args);
} // export async

export function lines(x: string | string[]) {
  return new Lines(x);
} // export function

export function columns(x: any[][]): Columns {
  return new Columns(x);
} // export function

export class Lines {
  readonly raw: string[];

  constructor(x: string | string[]) {
    if (typeof x === "string")
      this.raw = x.trim().split('\n');
    else
      this.raw = x;
  }

  get length() { return this.raw.length; }

  split(pattern: string | RegExp): Columns {
    return columns(
      this.raw.map(s => s.trim().split(pattern))
    );
  } // method

  map(...funcs: Array<(x: string) => string>): Lines {
    const f = pipe_function(...funcs);
    return lines(
      this.raw.map(s => f(s))
    );
  } // method

  filter(f: (s: string) => boolean): Lines {
    return lines(this.raw.filter(s => f(s)));
  } // method

  remove(f: (s: string) => boolean): Lines {
    return lines(this.raw.filter(s => !f(s)));
  } // method

  promise_all(f: (x: any) => Promise<any>): Promise<any> {
    return Promise.all(this.raw.map(f));
  } // method
} // class

export class Columns {
  raw: any[][];

  constructor(arr: any[][]) {
    if (arr.length === 0 || is_any(arr, is_length_0))
      throw new Error(`Columns may not be empty: ${Deno.inspect(arr)}`);
    this.raw = arr;
  } // constructor

  get row_count() { return this.raw.length; }
  get column_count() { return max(map_length(this.raw)); }
  get cell_count() { return sum(this.raw.map(x => x.length)); }
  get area() { return this.row_count * this.column_count; }

  // =============================================================================
  // Filter:
  // =============================================================================

  filter_rows(f: (x: any[]) => boolean): Columns {
    return columns(
      this.raw.filter(row => f(row))
    );
  } // method

  // =============================================================================
  // Remove:
  // =============================================================================

  remove_rows(f: (x: any[]) => boolean): Columns {
    return this.filter_rows(x => !f(x));
  } // method

  // =============================================================================
  // Arrange:
  // =============================================================================

  arrange(...spec: Arrange_Spec): Columns {
    return this.rows(row => rearrange(row, spec)) ;
  } // method

  // =============================================================================
  // Head/Tail:
  // =============================================================================

  head(i: number, t: "row"): Columns ;
  head(i: number, t: "column"): Columns;
  head(i: number, t: "row" | "column") {
    if (i < 1)
      throw new Error(`Invalid quantity for head(${i}, ${t})`);

    switch (`${i} ${t}`) {
      case "1 cell": { return this.raw[0][0]; }
      case "1 row": { return columns([this.raw[0]]); }
      case "1 column": { return this.arrange(0); }
    } // switch

    switch (t) {
      // case "cell": {
      //   throw new Error(`Quantity higher than 1 is not allowed: head(${i}, cell).`);
      // } // case

      case "row": {
        return columns(this.raw.slice(0, i));
      } // case

      case "column": {
        return this.arrange(...(count_up_to(i, this.column_count)));
      } // case
    } // switch
  } // method

  tail(i: number, t: "row" | "column"): Columns {
    if (i < 1)
      throw new Error(`Invalid quantity for tail(${i}, ${t})`);

    switch (`${i} ${t}`) {
      // case "1 cell": { return cell(this.raw[this.raw.length - 1].reverse()[0]); }
      case "1 row": { return columns([this.raw[this.raw.length - 1]]); }
      case "1 column": { return this.arrange(0); }
    } // switch

    switch (t) {
      // case "cell": {
      //   throw new Error(`Only 1 allowed for tail(${i}, cell)`);
      // } // case

      case "row": {
        return columns(this.raw.reverse().slice(0, i).reverse());
      } // case

      case "column": {
        const col_count = this.column_count;
        if (i > col_count)
          throw new Error(`${i} columns requested, but only ${col_count} exist.`);
        // return this.arrange(...(tail_indexes(this.raw[0], i)));
        return this.arrange(...(tail_count(i, this.column_count)));
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
        const last_cell_index = this.column_count - 1;
        const last_row_index  = this.raw.length - 1;
        const row      = this.raw[last_row_index].slice();
        const old_cell = row[last_cell_index];
        row[last_cell_index] = pipe_function(...funcs)(old_cell);
        return columns(this.raw.slice(0, last_row_index).concat([row]));
      } // case last
    } // switch
  } // method

  column(i: number, ...funcs: Array<(x: string) => string>) {
    const f = pipe_function(...funcs);
    if (i < 0)
      throw new Error(`Invalid value for column index: ${Deno.inspect(i)}`);
    if (i > this.column_count - 1)
      throw new Error(`Index value exceeds max column index: ${Deno.inspect(i)} > ${this.column_count - 1}`);
    const new_raw = this.raw.map(r => {
      const new_row = r.slice();
      new_row[i] = f(r[i]);
      return new_row;
    });
    return columns(new_raw);
  } // method

  map(...funcs: Array<(x: string) => string>) {
    const f = pipe_function(...funcs);
    const fin: any[][] = [];
    for (const old_row of this.raw)
      fin.push(old_row.map(f));
    return columns(fin);
  } // method

  rows(...funcs: Array<(x: string[]) => string[]>): Columns {
    const f = pipe_function(...funcs);
    return columns(
      this.raw.map(row => f(row))
    );
  } // method

  // =============================================================================
  // Push:
  // =============================================================================

  push_string(pos: "top" | "bottom" | "left" | "right", new_s: string) : Columns {
    switch (pos) {
      case "top": {
        const new_raw = this.raw.slice();
        new_raw.unshift(
          count(this.column_count).map(_x => new_s)
        );
        return columns(new_raw);
      } // case

      case "bottom": {
        const new_raw = this.raw.slice();
        new_raw.push(
          count(this.column_count).map(_x => new_s)
        );
        return columns(new_raw);
      } // case

      case "left": {
        const new_raw = this.raw.map(row => {
          const new_row = row.slice()
          new_row.unshift(new_s);
          return new_row;
        });
        return columns(new_raw);
      } // case

      case "right": {
        const new_raw = this.raw.map(row => {
          const new_row = row.slice();
          new_row.push(new_s);
          return new_row;
        });
        return columns(new_raw);
      } // case
    } // switch

  } // method

  push_function(pos: "top" | "bottom" | "left" | "right", f: () => any) {
    switch (pos) {
      case "top": {
        const new_raw = this.raw.slice();
        new_raw.unshift( count(this.column_count).map(_x => f()) );
        return columns(new_raw);
      } // case

      case "bottom": {
        const new_raw = this.raw.slice();
        new_raw.push( count(this.column_count).map(_x => f()) );
        return columns(new_raw);
      } // case

      case "left": {
        return columns(
          this.raw.map(row => {
            const new_row = row.slice();
            new_row.unshift(f());
            return new_row;
          })
        );
      } // case

      case "right": {
        return columns(
          this.raw.map(row => {
            const new_row = row.slice();
            new_row.push(f());
            return new_row;
          })
        );
      } // case
    }
  } // method

  push_columns(pos: "top" | "bottom" | "left" | "right", cols: Columns) : Columns {
    switch (pos) {
      case "top": {
        if (cols.column_count != this.column_count)
          throw new Error(`Column count mis-match: ${this.column_count} != push_columns(${pos}, ${cols.column_count})`);
        return columns(cols.raw.concat(this.raw));
      } // case

      case "bottom": {
        if (cols.column_count != this.column_count)
          throw new Error(`Column count mis-match: ${this.column_count} != push_columns(${pos}, ${cols.column_count})`);
        return columns(this.raw.concat(cols.raw));
      } // case

      case "left": {
        if (cols.row_count != this.row_count)
          throw new Error(`Row count mis-match: ${this.row_count} != push_columns(${pos}, ${cols.row_count})`);
        let index = -1;
        const fin: string[][] = [];
        for (const row of cols.raw) {
          ++index;
          fin.push(
            row.concat(this.raw[index])
          );
        } // for
        return columns(fin);
      } // case

      case "right": {
        if (cols.row_count != this.row_count)
          throw new Error(`Row count mis-match: ${this.row_count} != push_columns(${pos}, ${cols.row_count})`);
        let index = -1;
        const fin: string[][] = [];
        for (const row of this.raw) {
          ++index;
          fin.push(
            row.concat(cols.raw[index])
          );
        } // for
        return columns(fin);
      } // case
    } // switch
  } // method
} // export class
