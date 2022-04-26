
import {finish} from "https://github.com/da99/da.ts/raw/main/src/Spec.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {exists, ensureDir} from "https://deno.land/std/fs/mod.ts";

const this_file      = (new URL(import.meta.url)).pathname;
const this_file_name = (path.relative(path.dirname(this_file), this_file));
const dir            = path.basename(path.dirname(this_file));

await ensureDir("tmp/spec");

const cmd = Deno.args[0] || "full";

import "./FaunaDB.ts";
import {slow} from "./FaunaDB.migrate.ts";

if (cmd === "full") {  }

switch (cmd) {
  case "full": {
    slow();
    await finish();
    break;
  }
  case "quick": {
    await finish();
    break;
  }
  default: {
    await finish(cmd);
  }
} // switch
