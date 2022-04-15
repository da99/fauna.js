
import * as path from "https://deno.land/std/path/mod.ts";
import {run} from "../src/Process.ts";
import type {Result} from "../src/Process.ts";

// export async function find(cmd : string | string[] = ".") {
//   const proc = await run(cmd, "piped", "quiet")
// } // export function

  // const files = shell()
  //   .find(`--max-depth 4 --type f --size -15m --exec sha256sum {}`)
  //   .squeeze_whitespace()
  //   .split('\n')
  //   .cut(' ', 2)
  //   .filter_column(1, (x) => x.match(/^[a-zA-Z0-9\.\-\_]+$/))
  //   .map_column(1, (x)=> x.toUpperCase())
  // ;

export function stringy(s: string) { return new Stringy(s); } // export function
export function lines(l: string[]) { return new Lines(l); } // export function
export function columns(c: string[][]) { return new Columns(c); } // export function

export interface Slice_Args {
  args: number[],
  type: "range" | "to_end";
} // export interface

export function slice(n: number, end: number = -1): Slice_Args {
  if (n < 1 || end < -1 || end < 1)
    throw new Error(`Invalid number for slice(${n}, ${end})`);
  const args = [n];
  if (end !== -1)
    args.push(end);
  return({
    args,
    type: (end === -1) ? "to_end" : "range"
  });
} // export function

export async function fd(cmd: string | string[]) {
  if (typeof cmd === "string")
    cmd = cmd.split(/\s+/);
  const result = await run(["fd"].concat(cmd), "piped", "quiet");
  return lines(result.stdout.split('\n'));
} // async find

export class Stringy {
  value:   string;
  result?: Result;

  constructor(s: string = "") {
    this.value = s;
  }

  split(s: string = '\n') {
    return new Lines(this.value.split(s));
  } // method

  split_whitespace() {
    return new Lines(this.value.trim().split(/\s+/));
  } // method
} // export class

export class Lines {
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

  squeeze_whitespace() {
    this.value = this.value.map(x => x.replaceAll(/\s/, ' '))

    return this;
  } // method

  split(s: string = '\n') {
    return new Columns(this.value.map(x => x.split(s)));
  } // method

  cut(s: string, ...cols: Array<number | Slice_Args>): Columns {
    const result = this.value.reduce((prev, curr) => {
      const pieces = curr.split(s);
      let   entry = [] as string[];
      for (const i of cols) {
        if (typeof i === "number") {
          entry.push(pieces[i] || "");
          continue;
        }
        entry = entry.concat(pieces.slice(...(i.args)));
      } // for
      prev.push(entry);
      return prev;
    }, [] as string[][]);

    return columns(result);
  } // method

} // class

export class Columns {
  value: string[][];
  constructor(c: string[][]) {
    this.value = c;
  }
} // export class
