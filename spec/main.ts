
import {finish} from "../src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const this_file = (new URL(import.meta.url)).pathname;
const this_file_name = (path.relative(path.dirname(this_file), this_file));
const files: string[] = [];
const dir = path.basename(path.dirname(this_file));

for (const f of Deno.readDirSync(dir)) {
  if (f.isFile && f.name.indexOf('_') !== 0 && f.name.indexOf('.ts') === (f.name.length - 3) && f.name !== this_file_name) {
    files.push(`./${f.name}`);
  }
} // for

for (const f of files.sort()) {
  await import(f);
  // console.error(`imported ${f}`);
} // for

// import "./Spec.ts";
// import "./String.ts";
// import "./Text_File.ts";

await finish();
