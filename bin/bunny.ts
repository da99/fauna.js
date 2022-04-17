#!/usr/bin/env -S deno run --allow-run=fd,find --allow-read=./ --allow-write=./

// import * as path from "https://deno.land/std/path/mod.ts";
import {meta_url, match, values, not_found} from "../src/CLI.ts";
import {fd} from "../src/Shell.ts";
import {UPCASE, remove_pattern, begin_dot_slash, path_to_filename} from "../src/Function.ts";

meta_url(import.meta.url);

if (match("ls files", "Be sure to 'cd' into the Public directory you want to upload.")) {
  (await fd(`--max-depth 4 --type f --size -15m --exec sha256sum {} ;`))
  .cut('  ')
  .map_column(0, UPCASE)
  .map_column(1, remove_pattern(begin_dot_slash))
  .arrange(1,0,1)
  .map_column(2, path_to_filename('.'))
  .raw
  .map((r: string[]) => `${r[0]} ${r[1]}.${r[2]}`)
  .sort()
  .forEach(x => console.log(x));
} // if


not_found();
