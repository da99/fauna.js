
import {finish} from "../src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";

/*
 *  dev/spec quick
 *  dev/spec      # runs all the specs, including the slow ones.
 *
 */

const this_file = (new URL(import.meta.url)).pathname;
const this_file_name = (path.relative(path.dirname(this_file), this_file));
const dir = path.basename(path.dirname(this_file));

const all_files = Array.from(Deno.readDirSync(dir)).reduce((prev, curr) => {
  if (curr.isFile && import_it(curr.name))
    prev.push(curr.name);
  return prev;
}, [] as string[]).sort();

const slow_files = ["FaunaDB.ts"];
const fast_files = all_files.filter((x: string) => slow_files.indexOf(x) === -1);
let target_files: string[] = [];

function import_it(s: string): boolean {
  if (s.indexOf('_') === 0) // skip _helper.files.ts
    return false;

  if (s === this_file_name) // skip this file.
    return false;

  return(s.slice(-3) === '.ts'); // import only .ts files
} // function

const cmd = Deno.args[0];
// const args = Deno.args.slice(1);

switch (cmd) {
  case "quick": {
    target_files = fast_files;
    break;
  }
  case undefined: {
    target_files = fast_files.concat(slow_files);
    break;
  }
  default: {
    target_files = all_files.filter((f: string) => {
      return f.indexOf(cmd) > -1;
    });
  }
} // switch


for (const f of target_files) {
  await import(`./${f}`);
  // console.error(`imported ${f}`);
} // for

await finish();
