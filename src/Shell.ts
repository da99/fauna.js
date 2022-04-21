
// import * as path from "https://deno.land/std/path/mod.ts";
// import type {Result} from "./Process.ts";

import {run, throw_on_fail} from "./Process.ts";
import {rearrange} from "./Array.ts";
import {
  not,
  sum, map_length, count,
  pipe_function, max,
  is_length_0, is_any,
  tail_count
} from "./Function.ts";
import type {Arrange_Spec} from "./Array.ts";

export type Human_Position =
  "top row" | "bottom row" | "middle rows" |
  "first column" | "last column" | "middle columns" |
  "first cell" | "last cell" | "top last cell" | "bottom first cell" |
  "top row middle" | "bottom row middle"  |
  "left column middle" | "right column middle" |
  "borderless";

export interface Loop_Info {
  count: number;
  first: boolean;
  last:  boolean;
};

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

export function columns(x: any[] | any[][]): Columns {
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

  constructor(arr: any[] | any[][]) {
    if ( is_any(not(Array.isArray))(arr) )
      arr = arr.map(x => [x]);
    if (arr.length === 0 || is_any(is_length_0)(arr))
      throw new Error(`Columns may not be empty: ${Deno.inspect(arr)}`);
    this.raw = arr;
  } // constructor

  get row_count() { return this.raw.length; }
  get column_count() { return max(map_length(this.raw)); }
  get cell_count() { return sum(this.raw.map(x => x.length)); }
  get area() { return this.row_count * this.column_count; }

  clone() {
    return this.raw.slice().map(x => x.slice());
  } // method

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
  // Head/Middle/Tail:
  // =============================================================================

  head(i: number, t: "row" | "column") {
    if (i < 1)
      throw new Error(`Invalid quantity for head(${i}, ${t})`);

    switch (t) {
      case "row": {
        if (i < 0)
          i = this.raw.length + i;
        return columns(this.raw.slice(0, i));
      } // case

      case "column": {
        const col_count = this.column_count;
        if (i < 0)
          i = col_count + i;
        return this.middle(0, this.column_count - i, "column");
      } // case
    } // switch
  } // method

  middle(start: number, end: number, t: "row" | "column") {
    if (start < 0)
      throw new Error(`Invalid start for middle(${start}, ${end}, ${t})`);
    if (end < 0)
      throw new Error(`Invalid end for middle(${start}, ${end}, ${t})`);

    switch (t) {
      case "row": {
        const row_count = this.row_count;
        return columns(this.raw.slice(start, row_count - end));
      } // case

      case "column": {
        const col_count = this.column_count;
        return this.arrange(...(tail_count(col_count - start - end, col_count - end)));
      } // case
    } // switch
  } // method

  tail(i: number, t: "row" | "column"): Columns {
    if (i < 1)
      throw new Error(`Invalid quantity for tail(${i}, ${t})`);
    // switch (`${i} ${t}`) {
    //   // case "1 cell": { return cell(this.raw[this.raw.length - 1].reverse()[0]); }
    //   case "1 row": { return columns([this.raw[this.raw.length - 1]]); }
    //   case "1 column": { return this.arrange(this.column_count - 1); }
    // } // switch

    switch (t) {
      // case "cell": {
      //   throw new Error(`Only 1 allowed for tail(${i}, cell)`);
      // } // case

      case "row": {
        if (i < 0)
          i = this.raw.length + i;
        return columns(this.raw.reverse().slice(0, i).reverse());
      } // case

      case "column": {
        const col_count = this.column_count;
        if (i < 0)
          i = col_count + i;
        if (i > col_count)
          throw new Error(`${i} columns requested, but only ${col_count} exist.`);
        return this.arrange(...(tail_count(i, col_count)));
      } // case
    } // switch
  } // method

  // =============================================================================
  // Map:
  // =============================================================================

  map(pos: Human_Position | "values", ...funcs: Array<(x: any) => any>): Columns {
    if (pos === "values") {
      const f = pipe_function(...funcs);
      const fin: any[][] = [];
      for (const old_row of this.raw)
        fin.push(old_row.map(f));
      return columns(fin);
    } // if

    const indexes = human_position_to_indexes(pos, this.raw);
    if (indexes.length === 0) {
      throw new Error(`No values found in Columns for: ${Deno.inspect(pos)}`);
    } // if

    const new_arr = this.clone();
    const f = pipe_function(...funcs);
    for (const [r,c] of indexes) {
      new_arr[r][c] = f(new_arr[r][c]);
    } // for

    return columns(new_arr);
  } // method

  raw_column(pos: "first" | "last" | number) {
    return column_indexes(pos, this.raw)
    .map(rc => this.raw[rc[0]][rc[1]]);
  };

  column(n: number | "last", ...funcs: Array<(x: any) => any>) {
    let i = 0;
    if (n === "last")
      i = this.column_count - 1;
    else
      i = n;

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

  rows(...funcs: Array<(x: string[]) => string[]>): Columns {
    const f = pipe_function(...funcs);
    return columns(
      this.raw.map(row => f(row))
    );
  } // method

  row(n: number | "last", ...funcs: Array<(x: any) => any>) {
    let i = 0;
    if (n === "last")
      i = this.row_count - 1;
    else
      i = n;

    const f = pipe_function(...funcs);
    if (i < 0)
      throw new Error(`Invalid value for row index: ${Deno.inspect(i)}`);
    if (i > this.row_count - 1)
      throw new Error(`Index value exceeds max row index: ${Deno.inspect(i)} > ${this.column_count - 1}`);
    const new_raw = this.raw.slice();
    new_raw[i] = new_raw[i].slice().map(x => f(x));
    return columns(new_raw);
  } // method

  // =============================================================================
  // Push:
  // =============================================================================

  push_value(pos: "top" | "bottom" | "left" | "right", new_s: any) : Columns {
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

  push_function(pos: "top" | "bottom" | "left" | "right", f: (count: Loop_Info) => any) {
    switch (pos) {
      case "top": {
        const new_raw = this.raw.slice();
        const col_count = this.column_count;
        new_raw.unshift( count(this.column_count).map(count => {
          return f({count, first: count === 0, last: count === (col_count - 1) });
        }) );
        return columns(new_raw);
      } // case

      case "bottom": {
        const new_raw = this.raw.slice();
        const col_count = this.column_count;
        new_raw.push(
          count(col_count).map(count => {
            return f({count, first: count === 0, last: count === (col_count - 1) });
          })
        );
        return columns(new_raw);
      } // case

      case "left": {
        const row_count = this.row_count;
        return columns(
          this.raw.map((row, count) => {
            const new_row = row.slice();
            new_row.unshift(f({count, first: count === 0, last: count === (row_count - 1)}));
            return new_row;
          })
        );
      } // case

      case "right": {
        const row_count = this.row_count;
        return columns(
          this.raw.map((row, count) => {
            const new_row = row.slice();
            new_row.push(f({count, first: count === 0, last: count === (row_count - 1)}));
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

export function human_position_to_indexes(pos: Human_Position, arr: any[][]): number[][] {
  if (arr.length === 0)
    return [];

  switch (pos) {

    case "top row": {
      return arr[0].map((_x: any, i: number) => [0, i]);
    } // case

    case "bottom row": {
      if (arr.length < 2)
        return [];
      const last_row_index = arr.length - 1;
      const row = arr[last_row_index];
      return row.map((_x: any, i: number) => [last_row_index, i]);
    } // case

    case "middle rows": {
      if (arr.length < 3)
        return [];
      const slice = arr.slice(1, arr.length - 1);
      return slice.map((row, row_i) => {
        return row.map((_x, col_i) => [row_i + 1, col_i])
      }).flat();
    } // case

    case "first column": {
      return arr.map((_row, i) => [i, 0]);
    } // case

    case "last column": {
      return arr.map((row, i) => [i, row.length - 1]);
    } // case

    case "middle columns": {
      if (arr[0].length < 3)
        return [];
      const end_x = arr[0].length - 1;
      return arr.map((row, y) => {
        return row.slice(1, end_x).map((_x, col_i)=>[y, col_i+1])
      }).flat();
    } // case

    case "first cell": {
      if (arr[0].length === 0)
        return [];
      return [[0,0]];
    } // case

    case "last cell": {
      const last_row = arr[arr.length - 1];
      if (last_row.length === 0)
        return [];
      const last_cell_index = last_row.length - 1;
      return [[arr.length - 1, last_cell_index]];
    } // case

    case "top last cell": {
      const top_row = arr[0];
      if (top_row.length === 0)
        return [];
      return [[0, top_row.length - 1]]
    } // case

    case "bottom first cell": {
      const bottom_row = arr[arr.length - 1];
      if (bottom_row.length === 0)
        return [];
      return [[arr.length - 1, 0]]
    } // case

    case "top row middle": {
      const row = arr[0];
      if (row.length < 3)
        return [];
      const new_row = row.slice(1,row.length - 1);
      return new_row.map((_x, i) => [0, i+1]);
    } // case

    case "bottom row middle": {
      const row_index = arr.length - 1;
      const row = arr[row_index];
      if (row.length < 3)
        return [];
      const new_row = row.slice(1,row.length - 1);
      return new_row.map((_x, i) => [row_index, i+1]);
    } // case

    case "left column middle": {
      const fin: number[][] = [];
      let i = -1;
      const last_index = arr.length - 1;
      for (const _row of arr) {
        ++i;
        if (i === 0 || i === last_index )
          continue;
        fin.push([i, 0]);
      } // for
      return fin;
    } // case

    case "right column middle": {
      const fin: number[][] = [];
      let i = -1;
      const last_index = arr.length - 1;
      for (const row of arr) {
        ++i;
        if (i === 0 || i === last_index )
          continue;
        fin.push([i, row.length - 1]);
      } // for
      return fin;
    } // case

    case "borderless": {
      let fin: number[][] = [];
      let i = -1;
      const last_row_index = arr.length - 1;
      for (const row of arr) {
        ++i;
        if (i === 0 || i >= last_row_index)
          continue;
        const slice = row.slice(1, row.length - 1);
        if (slice.length === 0)
          return [];
        slice.forEach((_x, col_i) => fin.push([i, col_i + 1]));
      } // for
      return fin;
    } // case

  } // switch
} // export function

export function column_indexes(pos: number | "first" | "last", arr: any[][]): number[][] {
  let n = 0;
  if (arr.length === 0)
    return [];

  if (typeof pos === "number")
    n = pos;

  if (pos === "last")
    n = arr[0].length - 1;

  if (n < 0)
    throw new Error(`Invalid column index: column_indexes(${n}, arr)`);

  const fin: number[][] = [];
  let row_i = -1;
  for (const row of arr) {
    ++row_i;
    if (n < row.length)
      fin.push([row_i, n])
  } // for
  if (fin.length === 0)
    throw new Error(`Column index out of range: column_indexes(${n}, column_counts === ${Deno.inspect(arr.map(x=>x.length))})`);
  return fin;
} // export function

export function row_indexes(n: number, arr: any[][]): number[][] {
  if (arr.length === 0)
    return [];
  if (n < 0)
    throw new Error(`Invalid row index: row_indexes(${n}, arr)`);
  const fin: number[][] = [];
  if (n >= arr.length)
    throw new Error(`Row index out of range: row_indexes(${n}, arr.length === ${arr.length})`);
  let col_i = -1;
  for (const _col of arr[n]) {
    ++col_i;
    fin.push([n, col_i])
  } // for
  return fin;
} // export function
