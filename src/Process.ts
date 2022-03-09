
import {split_whitespace} from "../src/String.ts";
import { bold, red, green, yellow, bgRed, white } from "https://deno.land/std/fmt/colors.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

export interface Keep_Alive {
  cmd: Array<string>;
  process: Deno.Process<Deno.RunOptions>;
}

export interface Result {
  cmd:     string[];
  status:  Deno.ProcessStatus;
  process: Deno.Process<Deno.RunOptions>;
  stdout:  string;
  stderr:  string;
  success: boolean;
  code:    number;
}

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
      print_status(cmd, process.pid, status);
  } // if


  return {
    cmd, status, process,
    stdout, stderr,
    success: status.success,
    code:    status.code
  };
} // export

export function print_status(cmd: string[], pid: number, r: Deno.ProcessStatus) {
  const human_cmd = cmd.join(' ');
  if (r.success) {
    console.error(`--- (${pid}) ${green(human_cmd)} ---`);
  } else {
    console.error(`--- (${pid}) ${bgRed(white(" " + r.code.toString() + " "))}: ${bold(red(human_cmd))} ---`);
  }
} // export function

export async function keep_alive(...args: Array<string | string[]>) {

  const processes: Array<Keep_Alive> = [];

  const promises: Array<Promise<void>> = args.map((cmd: string | string[]) => {
    if (typeof cmd === "string")
      cmd = split_whitespace(cmd);
    const ka = {cmd, process: Deno.run({cmd})};
    processes.push(ka);
    return _keep_alive_process(ka);
  });

  Deno.addSignalListener("SIGUSR1", async () => {
    for (const proc of processes) {
      await run(`kill -TERM ${proc.process.pid}`, "inherit", "verbose-exit")
      if (Deno.resources()[proc.process.rid])
        proc.process.close();
    } // for
  });

  await Promise.all(promises);

} // export async

async function _keep_alive_process(proc: Keep_Alive) {
  while (true) {
    console.error(`\n=== ${proc.process.pid} ${yellow(proc.cmd.join(" "))} ===`);
    const status = await proc.process.status();
    if (Deno.resources()[proc.process.rid])
      proc.process.close();
    print_status(proc.cmd, proc.process.pid, status);
    proc.process = Deno.run({cmd: proc.cmd});
  }
} // async function

export async function pgrep_f(pattern: string): Promise<number[]> {
  const io = await run(["pgrep", "-f", pattern], "piped", "quiet");
  return split_whitespace(io.stdout).map(x => parseInt(x));
} // export async function

/*
 * Returns: A number[] of child processes (recursively). In other words,
 * the family tree of pids, including the PID originally passed to the
 * function.
 */
export async function pstree_p(pid: string | number): Promise<number[]> {
  const result = await run(`pstree --hide-threads --ascii -p ${pid}`);
  let pids: number[] = [];
  if (!result.success)
    return pids;

  // Output is something like: name(123)--name(456)--name(789)
  // The pattern here grabs just the whole numbers with lookbehind/lookahead.
  const match = result.stdout.match(/(?<=\()\d+(?=\))/g);
  if (match) {
    pids = match.map(
      (x: string) => parseInt(x)
    );
  }
  return pids;
} // export async function
