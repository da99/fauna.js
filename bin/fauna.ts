#!/usr/bin/env -S deno run --allow-run --allow-net --allow-read --allow-write=./

import {inspect,meta_url, match, values, not_found} from "https://github.com/da99/da.ts/raw/main/src/CLI.ts";
// import {pgrep_f, pstree_p, keep_alive, run, exit} from "https://github.com/da99/da.ts/main/src/Process.ts";
import { yellow, bold } from "https://deno.land/std/fmt/colors.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import {split_whitespace} from "https://raw.githubusercontent.com/da99/da.ts/main/src/String.ts";
import {install_latest as nodejs_install_latest} from "../src/NodeJS.ts";

import * as path from "https://deno.land/std/path/mod.ts";

meta_url(import.meta.url);

if (match("migrate")) {
  console.error("migrating");
} // if

// =============================================================================
// Finish:
// =============================================================================
not_found();
// =============================================================================

