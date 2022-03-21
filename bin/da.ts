#!/usr/bin/env -S deno run --unstable --allow-run=find,ln,tar,npm,npx --allow-net --allow-read=./ --allow-write=./

import {meta_url, about, match, values, not_found} from "../src/CLI.ts";
import {pgrep_f, pstree_p, keep_alive, run, run_and_exit} from "../src/Process.ts";
import {build_www, build_app} from "../src/Build_WWW.ts";
import { yellow, bold, bgRed, white } from "https://deno.land/std/fmt/colors.ts";

// import {Text_File, find_parent_file} from "../src/FS.ts";
// import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import {create_from_template} from "./_.template.ts";
import {split_whitespace} from "../src/String.ts";
import {install_latest as nodejs_install_latest} from "../src/NodeJS.ts";
import {start} from "./_.file_server.ts";

import * as path from "https://deno.land/std/path/mod.ts";

meta_url(import.meta.url);
// const _this = about();

if (match(".gitignore")) {
  await create_from_template("gitignore", ".gitignore");
} // if

if (match("ts bin/test")) {
  await create_from_template("spec_run.ts", "bin/test");
  await create_from_template("spec___.ts", "spec/__.ts");
} // if

if (match("ts spec/ <Name>")) {
  const [name] = values() as string[];
  create_from_template("spec.ts", `spec/${name}.ts`);
} // if

if (match("ts src/ <Name>")) {
  const [name] = values() as string[];
  create_from_template("src.ts", `src/${name}.ts`);
} // if

if (match("<zsh|sh|ts> <relative/path/to/file>")) {
  let [extension, fpath] = values() as string[];
  if (["bin", "src", "spec"].includes(path.basename(fpath))) {
    const PROJECT_NAME = path.basename(Deno.cwd());
    fpath = path.join(fpath, PROJECT_NAME)
  }

  create_from_template(`bin.${extension}`, fpath);
} // if

if (match("keep-alive <...args>")) {
  const args = Deno.args.slice(1);
  console.error(`=== ${Deno.args[0]} ${args.map(x => Deno.inspect(x)).join(" ")}`);
  const cmds = args.map(x => split_whitespace(x));
  await keep_alive(...cmds);
} // if

if (match("file-server start <json>")) {
  await start(JSON.parse((values()[0] as string).trim()));
} // if

if (match("file-server stop")) {
  const {code} = await run(split_whitespace(`pkill -INT -f`).concat(['^deno run .+ file-server start .+']), "inherit", "verbose-exit");
  Deno.exit(code);
} // if

if (match("file-server reload www-browser")) {
  await run_and_exit(['pkill', '-USR1', '-f', '^deno run .+bin/_.file_server.ts']);
} // if

if (match("build [css|js|html] <url_path> <json_config>")) {
  const [group, filepath, config] = values();
  await build_www(
    group as "css" | "js" | "html",
    filepath as string, JSON.parse(config as string)
  );
} // if

if (match("build [app|public|worker] <json_config>")) {
  const [group, config] = values();
  await build_app(
    group as "app" | "public" | "worker",
    JSON.parse(config as string)
  );
} // if

// # =============================================================================
// # === NodeJS related:
// # =============================================================================
if (match("nodejs install latest")) {
  nodejs_install_latest();
} // if

// # =============================================================================
// # === Process related:
// # =============================================================================
if (match("ls child pids <pattern>")) {
  const [pattern] = values();
  let pids = await pgrep_f(pattern as string);
  (
    await Promise.all(pids.map(x => pstree_p(x)))
  ).flat().forEach(x => console.log(x));
} // if

not_found();

