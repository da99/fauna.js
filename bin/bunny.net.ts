

import {meta_url, match, values, not_found} from "../src/CLI.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {run, exit, exit_on_fail} from "../src/Process.ts";

meta_url(import.meta.url);



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
