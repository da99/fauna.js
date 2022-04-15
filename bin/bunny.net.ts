


import {meta_url, match, values, not_found} from "../src/CLI.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {run, exit, exit_on_fail} from "../src/Process.ts";
import type {Result} from "../src/Process.ts";

meta_url(import.meta.url);

export async function find(cmd : string | string[] = ".") {
  const proc = await run(cmd, "piped", "quiet")
} // export function

class Shell {
  value: string[];
  result?: Result;
  column_count: number = 0;
  constructor(x: string[] = []) {
    this.value = x;
  }

  get length() { return this.value.length; }

  async find(cmd: string | string[]) {
    if (this.length !== 0)
      throw new Error(`Value already set: ${Deno.inspect(this.value, {colors: true})}`);
    if (typeof cmd === "string")
      cmd = cmd.split(/\s+/);
    this.result = await run(cmd, "piped", "quiet");
    this.value = this.result.stdout.split('\n');

    return this;
  } // async find

  replace_all(pattern: RegExp | string, target: string) {
    this.value = this.value.map(x => x.replaceAll(pattern, target));

    return this;
  } // method

  squeeze_whitespace() {
    this.value = this.value.map(x => x.replaceAll(/\s/, ' '))

    return this;
  } // method

  split(s: string = '\n') {
    this.value = this.value.map(x => x.split(x));
    return this;
  } // method

  cut(s: string, ...cols: number[]) {
    if (this.column_count !== 0)
      throw new Error(`Already has columns: ${Deno.inspect(this.value)}`);

    this.value = (this.value as string[]).reduce((prev, curr) => {
      const pieces = curr.split(s);
      const entry = [] as string[];
      for (const i of cols) {
        entry.push(pieces[i] || "");
      }
      prev.push(entry);
      return prev;
    }, [] as string[][]);

    this.column_count = 1;
    return this;
  } // method

} // class

export function shell(x: string[] = []) {
  return new Shell(x);
} // export function

if (match("ls files")) {
  const files = shell()
    .find(`--max-depth 4 --type f --size -15m --exec sha256sum {}`)
    .squeeze_whitespace()
    .split('\n')
    .cut(' ', 2)
    .filter_column(1, (x) => x.match(/^[a-zA-Z0-9\.\-\_]+$/))
    .map_column(1, (x)=> x.toUpperCase())
  ;
} // if
