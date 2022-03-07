
import {split_whitespace} from "../src/String.ts";
import { bold, red, green, yellow, bgRed, white } from "https://deno.land/std/fmt/colors.ts";

export interface Result {
  cmd:     string[];
  status:  Deno.ProcessStatus;
  process: Deno.Process<Deno.RunOptions>;
  stdout:  string;
  stderr:  string;
  success: boolean;
  code:    number;
};

export async function run_or_exit(full_cmd: string) {
  const result = await Deno.run({cmd: split_whitespace(full_cmd)}).status();
  if (!result.success) {
    Deno.exit(result.code);
  }
  return result;
} // async function

export function string_to_array(x: string | string[]) {
  if (Array.isArray(x))
    return x;
  return split_whitespace(x);
} // export function

export async function run_or_throw(x: string | string[]) {
  const r = await run(x);
  if (r.status.success) {
    return r
  }
  const msgs = [`Exit ${r.status.code}: ${string_to_array(x).join(' ')}`, r.stdout, r.stderr].join("\n").trim();
  throw new Error(msgs);
} // export async function

export async function run(
  arr: string | string[],
  std: | "inherit" | "piped" | "null" | number = "piped",
  verbose: "verbose" | "verbose-exit" | "verbose-fail" | "quiet" = "quiet"
): Promise<Result> {
  const cmd    = string_to_array(arr);
  let stdout   = "";
  let stderr   = "";

  if (verbose === "verbose") {
      console.error(`=== ${yellow(cmd.join(" "))} ===`);
  } // if

  const process = Deno.run({ cmd, stderr: std, stdout: std });
  const status  = await process.status();

  // NOTE: For some reason, the process is never closed automatically.
  // At this point, we can close it manually since we have all the output
  // we need.
  process.close();

  if (std === "piped") {
      stdout = new TextDecoder().decode(await process.output());
      stderr =  new TextDecoder().decode(await process.stderrOutput());
  } // if

  if (verbose === "verbose" || verbose === "verbose-exit" || (!status.success && verbose === "verbose-fail" )) {
      print_status(cmd, status);
  } // if


  return {
    cmd, status, process,
    stdout, stderr,
    success: status.success,
    code:    status.code
  };
} // export

export function print_status(cmd: string[], r: Deno.ProcessStatus) {
  const human_cmd = cmd.join(' ');
  if (r.success) {
    console.error(`--- ${green(human_cmd)} ---`);
  } else {
    console.error(`--- ${bgRed(white(" " + r.code.toString() + " "))}: ${bold(red(human_cmd))} ---`);
  }
} // export function

export async function keep_alive(cmd: string | string[]) {
  if (typeof cmd === "string")
    cmd = split_whitespace(cmd);
  const opts = { cmd };
  let proc: null | Deno.Process<typeof opts> = null;

  Deno.addSignalListener("SIGUSR1", async () => {
    const old_proc = proc;
    if (old_proc) {
      await run(`kill -TERM ${old_proc.pid}`, "inherit", "verbose-exit")
    }
  });

  do {
    console.error(`\n=== ${yellow(opts.cmd.join(" "))} ===`);
    proc = Deno.run(opts);
    const x = await proc.status();
    print_status(opts.cmd, x);
  } while (true);
} // export async

