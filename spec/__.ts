
import {finish} from "../src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {exists, ensureDir} from "https://deno.land/std/fs/mod.ts";

const this_file      = (new URL(import.meta.url)).pathname;
const this_file_name = (path.relative(path.dirname(this_file), this_file));
const dir            = path.basename(path.dirname(this_file));

await ensureDir("tmp/spec");

const cmd = Deno.args[0] || "full";

import "./CLI.ts";
import "./FaunaDB.ts";
import "./Process.ts";
import "./Spec.ts";
import "./String.ts";
import "./Text_File.ts";
import "./File_Manifest.ts";
import "./Shell.ts";
import {slow} from "./FaunaDB.migrate.ts";

if (cmd === "full") { slow(); }

if (cmd === "full")
  await finish();
else
  await finish(cmd);

