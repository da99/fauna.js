
import {finish} from "../src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";

/*
 *  dev/spec quick
 *  dev/spec      # runs all the specs, including the slow ones.
 *
 */

const this_file = (new URL(import.meta.url)).pathname;
const this_file_name = (path.relative(path.dirname(this_file), this_file));
const files: string[] = [];
const dir = path.basename(path.dirname(this_file));

function import_it(s: string) {
  if (s.indexOf('_') === 0) // skip _helper.files.ts
    return false;

  if (s === this_file_name) // skip this file.
    return false;

  if (Deno.args.includes("quick")) {
    if (s === "FaunaDB.ts")
      return false;
  }

  return(s.slice(-3) === '.ts'); // import only .ts files
} // function

for (const f of Deno.readDirSync(dir)) {
  if (f.isFile && import_it(f.name)) {
    files.push(`./${f.name}`);
  }
} // for

for (const f of files.sort()) {
  await import(f);
  // console.error(`imported ${f}`);
} // for

await finish();
