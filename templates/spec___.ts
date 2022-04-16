
import {finish} from "{DA_PATH}/src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {exists, ensureDir} from "https://deno.land/std/fs/mod.ts";

const this_file       = (new URL(import.meta.url)).pathname;
const this_file_name  = (path.relative(path.dirname(this_file), this_file));
const files: string[] = [];
const dir             = path.basename(path.dirname(this_file));

await ensureDir("tmp/spec");


const cmd = Deno.args[0];

if (cmd)
  await finish(cmd);
else
  await finish();
