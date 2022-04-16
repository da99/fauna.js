
import * as path from "https://deno.land/std/path/mod.ts";
import {run} from "./Process.ts";
import type {Result} from "./Process.ts";
import {
  split_whitespace as  splitws,
  squeeze_whitespace as squeezews
} from "./String.ts";


  //   .filter_column(1, (x) => x.match(/^[a-zA-Z0-9\.\-\_]+$/))
  //   .map_column(1, (x)=> x.toUpperCase())

export function apply_if_string(f: (x: string) => any) {
  return((x: any) => (typeof x === "string") ? f(x as string) : x);
} // export function

export interface Slice_Spec {
  begin: number,
  end:   number,
  type:  "head" | "tail" | "slice";
} // export interface

export function head(n: number): Slice_Spec {
  if (n < 1)
    throw new Error(`Invalid value for head(${Deno.inspect(n)})`);
  return({ begin: 0, end: n, type: "head" });
} // export function

export function tail(n: number): Slice_Spec {
  if (n < 1)
    throw new Error(`Invalid value for tail(${Deno.inspect(n)})`);
  return({ begin: 0, end: n, type: "tail" });
} // export function

export function slice(n: number, quantity: number): Slice_Spec {
  if (n < 0 || quantity < 0)
    throw new Error(`Invalid number for slice(${Deno.inspect(n)}, ${Deno.inspect(quantity)})`);
  return({
    begin: n,
    end: quantity,
    type: "slice"
  });
} // export function

export function range(n: number, end: number): Slice_Spec {
  if (n < 0 || end <= end)
    throw new Error(`Invalid number for slice(${Deno.inspect(n)}, ${Deno.inspect(end)})`);
  return({
    begin: n,
    end: end - n,
    type: "slice"
  });
} // export function

export function merge_columns(...arrs: any[][]) {
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

export function rows(x: any) {
  if (typeof x === 'string')
    return new Rows(x.split('\n'));
  return new Rows(x)
} // export function

export function columns(x: any[][]) {
  return new Columns(x)
} // export function

export async function fd(cmd: string | string[]) {
  if (typeof cmd === "string")
    cmd = splitws(cmd);
  const result = await run(["fd"].concat(cmd), "piped", "quiet");
  return rows(result.stdout);
} // async find

export async function find(cmd: string | string[]) {
  if (typeof cmd === "string")
    cmd = splitws(cmd);
  const result = await run(["find"].concat(cmd), "piped", "quiet");
  return rows(result.stdout);
} // async find

export function split_whitespace(s: string) {
  return rows(splitws(s));
} // export function

export function arrange_columns<T>(arr: T[], spec: Array<number | Slice_Spec>): T[] {
  let new_arr: T[] = [];
  for (const i of spec) {
    if (typeof i === "number") {
      const v = arr[i];
      if (typeof v !== "undefined")
        new_arr.push(v);
      continue;
    }
    switch (i.type) {
      case "head": {
        new_arr = new_arr.concat(arr.slice(i.begin, i.end));
        break;
      }
      case "tail": {
        new_arr = new_arr.concat(arr.slice(arr.length - i.end))
        break;
      }
      case "slice": {
        new_arr = new_arr.concat(arr.slice(i.begin, i.end))
        break;
      }
      default: {
        throw new Error(`Not implemented: ${i.type} for arrange_columns`)
      }
    }
  } // for

  return new_arr;
} // export function

export class Rows {
  value:        string[];
  result?:      Result;
  column_count: number = 0;

  constructor(l: string[]) {
    this.value = l;
  }

  get length() { return this.value.length; }

  replace_all(pattern: RegExp | string, target: string) {
    this.value = this.value.map(x => x.replaceAll(pattern, target));

    return this;
  } // method

  update(f: (x: any) => any) {
    this.value = this.value.map(y => f(y));
    return this;
  } // method

  squeeze_whitespace() {
    this.update(squeezews);
    return this;
  } // method

  cut_columns(s: string | RegExp, ...cols: Array<number | Slice_Spec>): Columns {
    const result = this.value.reduce((prev, curr) => {
      const pieces = curr.trim().split(s);
      if (cols.length === 0)
        prev.push(pieces);
      else
        prev.push(
          arrange_columns(pieces, cols)
        );
      return prev;
    }, [] as string[][]);

    return columns(result);
  } // method

  map<T>(f: (s: string) => T): T[] {
    return this.value.map(s => f(s));
  } // method

  compact() {
    const new_row = [];
    for (const c of this.value) {
      if (typeof c === "undefined" || c === null)
        continue;
      new_row.push(c)
    }
    this.value = new_row;
    return this;
  } // method

  map_promise_all(f: (x: any) => Promise<any>) {
    return Promise.all(
      this.value.map(x => f(x))
    );
  } // method

  promise_all() {
    return Promise.all(this.value);
  } // method
} // class

export class Columns {
  value: any[][];

  constructor(c: any[][]) {
    this.value = c;
  }

  get row_count() { return this.value.length; }
  get column_count() { return this.value.reduce((max, row) => { return (row.length < max) ? max : row.length; }, 0); }
  get cell_count() { return this.value.reduce((prev, curr) => { return prev + curr.length; }, 0); }
  get area() { return this.row_count * this.column_count; }

  update_cells(f: (x: any) => any) {
    this.update_rows(
      row => row.map(c => f(c))
    );
    return this;
  } // method

  update_rows(f: (x: any[]) => any[]) {
    this.value = this.value.map(
      row => f(row)
    );
    return this;
  } // method

  squeeze_whitespace() {
    return this.update_cells(x => apply_if_string(squeezews));
  } // method

  split_whitespace() {
    return this.update_rows(row => row.map(apply_if_string(splitws)).flat());
  } // method

  map_rows(f: (x: any[]) => any): any[] {
    return this.value.map( row => f(row));
  } // method

  map_cells(f: (x: any) => any): any[][] {
    return this.value.map(
      row => row.map(c => f(c))
    );
  } // method

  compact() {
    const fin = [];
    for (const row of this.value) {
      const new_row = [];
      for (const c of row) {
        if (typeof c === "undefined" || c === null)
          continue;
        new_row.push(c)
      }
      if (new_row.length > 0)
        fin.push(new_row);
    }
    this.value = fin;
    return this;
  } // method

} // export class
