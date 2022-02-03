#!/usr/bin/env -S deno run --allow-run=mkdir --allow-write="src/,tmp/,./" --allow-read="/apps/da.ts/templates,./"
// --allow-net="raw.githubusercontent.com" 

import heredoc from "https://raw.githubusercontent.com/jwalton/tsheredoc/master/src/index.ts";
import {Text_File} from "../src/Text_File.ts";
import {split_whitespace} from "../src/String.ts";
import {cli} from "../src/CLI.ts";
import {ensureDirSync} from "https://deno.land/std@0.123.0/fs/mod.ts";

cli.on("create <spec|src|bin> <Name>", async function (name: string) {
  ensureDirSync("spec");
  write_file(`spec/${name}.ts`, compile_template("spec_Create.ts", {Name: name}));
}); // cli.on

cli.on("create src <Name>", async function (name: string) {
  await run(`mkdir -p src`);
  write_file(`src/${name}.ts`, compile_template("src_Create.ts", {Name: name}));
}); // cli.on

cli.run();

async function run(full_cmd: string) {
  const result = await Deno.run({cmd: split_whitespace(full_cmd)}).status();
  if (!result.success) {
    Deno.exit(result.code);
  }
  return result;
} // async function

function compile_template(fname: string, vars: object) {
  const f = new Text_File(`/apps/da.ts/templates/${fname}`);
  let text = f.text || "";
  for (const [k,v] of Object.entries(vars)) {
    text = text.replaceAll(k, v);
  } // for
  return text;
} // function

function write_file(fpath: string, new_content: string) {
    const file = new Text_File(fpath);
    const old_text = file.text;
    if (file.not_empty) {
      console.error(`=== File already exists: ${file.filename}`);
      return false;
    }

    file.write(new_content);
    console.log(`=== Wrote: ${file.filename}`);
    return true;
} // function

