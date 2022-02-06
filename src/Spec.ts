
import { Text_File } from "../src/Text_File.ts";
import { colorize } from "../src/CLI.ts";
import { bold as BOLD, blue as BLUE, green as GREEN, red as RED  } from "https://deno.land/std/fmt/colors.ts";

// # =============================================================================
type Asyn_Function = () => Promise<void>;
type Void_Function = () => void;


// # =============================================================================
const CHECK_MARK = "✓";
const X_MARK = "✗";

// # =============================================================================
function is_async_function(x: any) {
  return typeof(x) === "object" && x.constructor.name === "AsyncFunction";
} // function

// # =============================================================================
let current_desc                   = "Unknown";
let current_it                     = false;
let has_printed_filename           = false;
let last_fail_title: null | string = null;
let the_file_name: null | string = null;

const LAST_FAIL_FILE                             = "tmp/spec/last.fail";
const PRINT_STACK: Array<Record<string, string>> = [];

try{
  last_fail_title = Deno.readTextFileSync(LAST_FAIL_FILE);
} catch(e) {
  // ignore
}

export function filename(f: string) {
  if (f.indexOf(":")) {
    the_file_name = (new URL(f)).pathname;
  } else {
    the_file_name = f;
  }
} // function

function it_last_fail(raw_title: string) {
  PRINT_STACK[0]
  return `${current_desc} ${raw_title}`;
} // function

function print_filename() {
  if (has_printed_filename) {
    return false;
  }

  const pathname = (new URL(import.meta.url)).pathname;
  prompt(`\nFile: ${BOLD(the_file_name || "unknown")}\n`);
  has_printed_filename = true;
  return true;
} // function

function prompt(raw_text: string) {
  return Deno.writeAllSync(
    Deno.stderr,
    new TextEncoder().encode(raw_text)
  );
} // function

export function describe(title: string) {
  current_desc = title;
} // function

export function it(raw_title: string, raw_f: Void_Function | Asyn_Function) {
  const desc_title   = current_desc;
  const full_title   = `${desc_title} ${raw_title}`;
  const version      = `${the_file_name} ${full_title}`;
  const is_last_fail = (last_fail_title === version)
  const first_it     = !current_it;
  const do_print_filename = !has_printed_filename;
  current_it = true;

  const f: null | (() => Promise<void>) = (raw_f.constructor.name === "Async Function") ?
    (raw_f as Asyn_Function) :
    (function () { return Promise.resolve(raw_f()); });

  const wrapper_f = async function () {
    if (do_print_filename)
      print_filename();
    if (first_it)
      prompt(`${desc_title}\n`);
    prompt(`  ${raw_title}`);

    if (last_fail_title && !is_last_fail) {
      prompt(` ???\n`);
      return;
    }

    let has_pass = false;

    try {
      await f();
      prompt(colorize(` ${CHECK_MARK}\n`, "GREEN"));
      has_pass = true;
      if (is_last_fail) {
        await Deno.remove(LAST_FAIL_FILE);
      }
    } catch (e) {
      prompt(colorize(` ${X_MARK}\n`, "RED", "BOLD"));
      prompt(e.message);
      has_pass = false;
      await Deno.writeTextFile(LAST_FAIL_FILE, version);
      throw e;
    }
  }; // async

  if (!last_fail_title || is_last_fail) {
    prompt(`${Deno.inspect(last_fail_title)} ${Deno.inspect(is_last_fail)}`);
    return Deno.test({
      name: raw_title,
        fn: wrapper_f
    });
  } // if
} // function


