
import {Text_File, find_parent_file} from "../src/FS.ts";
import {split_whitespace, insert_after_line_contains} from "../src/String.ts";
import {cmd_name, match, values, not_found} from "../src/CLI.ts";
import { yellow, bold } from "https://deno.land/std/fmt/colors.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const THIS_DIR = path.dirname(path.dirname((new URL(import.meta.url)).pathname));

cmd_name("da.ts");

function in_da_ts_dir() {
  const p = Deno.cwd();
  const info = path.parse(p);
  return info.base === "da.ts";
} // export

if (match(".gitignore")) {
  const f = new Text_File(".gitignore");
  const t = new Text_File(`${THIS_DIR}/templates/gitignore`);
  f.write(add_unique_text(f.text || "", t.text || ""));
  console.log(`=== Wrote: ${f.filename}`);
  console.log((new Text_File(".gitignore")).text);
} // if

if (match("init spec.ts")) {
  await create_from_template("spec_run.ts", "spec/run");
  await create_from_template("spec___.ts", "spec/__.ts");
} // if

if (match("<spec.ts|src.ts> <Name>")) {
  const [tmpl_name, name] = values() as string[];
  const t_name = tmpl_name.replace(".ts", "");
  const fpath = `${t_name}/${name}.ts`;
  create_from_template(tmpl_name, fpath);
} // if

if (match("<zsh|sh> <relative/path/to/file>")) {
  const [tmpl_name, fpath] = values() as string[];
  create_from_template(tmpl_name, fpath);
} // if

if (match("keep-alive reload")) {
  const cmd = ["pkill", "-f", "^deno .+ keep-alive"];
  console.error(`=== ${yellow(cmd[0])} ${bold(cmd.slice(1).join(' '))}`);
  await Deno.run({cmd}).status();
} // if

not_found();

function relative_to_da(fpath: string) {
  const da_dir = path.dirname(path.dirname((new URL(import.meta.url)).pathname));
  return path.relative(path.parse(fpath).dir, da_dir);
} // function

async function create_from_template(tmpl_name: string, fpath: string) {
  const info = path.parse(fpath);
  const dir  = info.dir;
  const name = info.name;
  const ext  = info.ext;

  const full_path = path.resolve(path.join(Deno.cwd(), fpath));

  const vals: Record<string, string> = {
    Name: name,
    name,
    "DA_PATH": relative_to_da(fpath)
  };
  const file = new Text_File(fpath);

  ensureDirSync(dir);

  if (file.not_empty) {
    console.error(`=== File already exists: ${file.filename}`);
  } else {
    file.write(compile_template(tmpl_name, vals));
    const update_file = new Text_File(fpath);
    if ((update_file.text || "").indexOf("#!") === 0) {
      await Deno.chmod(fpath, 0o700);
    }
    console.log(`=== Wrote: ${file.filename}`);
  } // if
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

