#!/usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=./

import {inspect, template, meta_url, match, values, not_found} from "https://github.com/da99/da.ts/raw/main/src/Shell.ts";
// import {pgrep_f, pstree_p, keep_alive, run, exit} from "https://github.com/da99/da.ts/main/src/Process.ts";
import { yellow, bold } from "https://deno.land/std/fmt/colors.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import {split_whitespace} from "https://raw.githubusercontent.com/da99/da.ts/main/src/String.ts";
import {install_latest as nodejs_install_latest} from "../src/NodeJS.ts";

import * as path from "https://deno.land/std/path/mod.ts";

meta_url(import.meta.url);

if (match("template migrate <file.ts>")) {
  const [file] = values() as string[];
  await template("https://github.com/da99/fauna.ts/raw/main/templates/migrate.ts", file);
} // if

// =============================================================================
// Finish:
// =============================================================================
not_found();
// =============================================================================

