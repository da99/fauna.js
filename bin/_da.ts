// #!/usr/bin/env -S deno run --allow-run="mkdir" --allow-read="/path/to/da/templates/,./" --allow-write="bin/,spec/,src/,tmp/,./" 
// --allow-net="raw.githubusercontent.com" 

import {Text_File} from "../src/Text_File.ts";
import {unique_text} from "../src/Array.ts";
import {split_whitespace} from "../src/String.ts";
import {cmd_name, match, values, not_found} from "../src/CLI.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const THIS_DIR = path.dirname(path.dirname((new URL(import.meta.url)).pathname));

cmd_name("da.ts");

if (match("create .gitignore")) {
  const f = new Text_File(".gitignore");
  const t = new Text_File(`${THIS_DIR}/templates/gitignore`);
  f.write(add_unique_text(f.text || "", t.text || ""));
  // f.write(unique_text(lines).join("\n"));
  console.log(`=== Wrote: ${f.filename}`);
  console.log((new Text_File(".gitignore")).text);
} // if

if (match("create dev/spec")) {
  let t_type = "dev_spec.ts";
  const fpath = "dev/spec";

  ensureDirSync("dev");

  if ((new Text_File("shard.yml")).exists) {
    t_type = "dev_spec.cr";
  }
  create_from_template(t_type, fpath);

} // if

if (match("create <relative/path/required.ext>")) {
  const [fpath] = values();
  const info = path.parse(fpath);
  const top = info.dir.split('/')[0] || "";
  let   tmpl_name = `${top}${info.ext}`;

  try {
    create_from_template(tmpl_name, fpath);
  } catch (e) {
    if (e.name === "NotFound") {
      console.error(`!!! Template type not found: ${tmpl_name} => ${fpath}`);
      Deno.exit(1);
    }
    throw e;
  }
} // if

if (match("create <template name> </absolute/or/relative/path/optional.ext>")) {
  let [tmpl_name, fpath] = values();
  const info             = path.parse(fpath);
  let tmpl_name_ext      = `${tmpl_name}${info.ext}`;

  try {
    create_from_template(tmpl_name, fpath);
  } catch (e) {
    if (e.name === "NotFound") {
      create_from_template(tmpl_name_ext, fpath);
    } else {
      throw e
    }
  } // try/catch
  await Deno.chmod(fpath, 0o700);
} // if

not_found();

function create_from_template(tmpl_name: string, fpath: string) {
  const info = path.parse(fpath);
  const dir  = info.dir;
  const name = info.name;
  const ext  = info.ext;
  const vals: Record<string, string> = {Name: name, name};
  ensureDirSync(dir);

  const file = new Text_File(fpath);
  if (file.not_empty) {
    console.error(`=== File already exists: ${file.filename}`);
    Deno.exit(0);
  }
  file.write(compile_template(tmpl_name, vals));
  console.log(`=== Wrote: ${file.filename}`);
} // function

function compile_template(fname: string, vars: Record<string, string>) {
  let text = Deno.readTextFileSync(`${THIS_DIR}/templates/${fname}`);
  for (const [k,v] of Object.entries(vars)) {
    text = text.replaceAll(k, v);
  } // for
  return text;
} // function

function add_unique_text(a: string, b: string) : string {
  let i = 0;
  const a_arr = a.split("\n")
  const a_unique = a_arr.map((s: string) => split_whitespace(s).join(' ')).reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {} as Record<string, boolean>);
  const b_unique = b.split("\n").map(x => split_whitespace(x).join(' '));
  b_unique.forEach(x => {
    if (x.length > 0 && !a_unique[x]) {
      a_arr.push(x);
    }
  });
  return a_arr.join("\n");
} // function
