#!/usr/bin/env -S deno run --allow-run=mkdir --allow-write="src/,tmp/,./" --allow-read="/apps/da.ts/templates,./"
// --allow-net="raw.githubusercontent.com" 

import {Text_File} from "../src/Text_File.ts";
import {match, values, not_found} from "../src/CLI.ts";
import {ensureDirSync} from "https://deno.land/std@0.123.0/fs/mod.ts";


if (match("create <spec|src|bin> <Name>")) {
  const [dir, name] = values();
  const file = new Text_File(`${dir}/${name}.ts`);

  ensureDirSync(dir);

  if (file.not_empty) {
    console.error(`=== File already exists: ${file.filename}`);
    Deno.exit(0);
  }

  const new_content = compile_template(`create_${dir}.ts`, {Name: name});
  file.write(new_content);
  console.log(`=== Wrote: ${file.filename}`);
}

if (match("delete <spec|src|bin> <Name>")) {
  const [dir, name] = values();
  console.log(Deno.args);
}

not_found();

function compile_template(fname: string, vars: Record<string, string>) {
  const f = new Text_File(`/apps/da.ts/templates/${fname}`);
  let text = f.text || "";
  for (const [k,v] of Object.entries(vars)) {
    text = text.replaceAll(k, v);
  } // for
  return text;
} // function

