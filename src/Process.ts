
import {split_whitespace} from "../src/String.ts";

export async function run_or_exit(full_cmd: string) {
  const result = await Deno.run({cmd: split_whitespace(full_cmd)}).status();
  if (!result.success) {
    Deno.exit(result.code);
  }
  return result;
} // async function

export async function run(o: Deno.RunOptions) {
  const default_options: Deno.RunOptions = {
    cmd: ["exit", "1"],
    stderr: "piped",
    stdout: "piped"
  };
  const final_o = Object.assign({}, default_options, o);
  const proc = Deno.run(final_o);
  const result     = await proc.status();

  let s_o: string | null = null;
  let s_e: string | null = null;

  if (final_o.stdout === "piped") {
    s_o = new TextDecoder().decode(await proc.output());
  }

  if (final_o.stderr === "piped") {
    s_e = new TextDecoder().decode(await proc.stderrOutput());
  }

  // NOTE: For some reason, the process is never closed automatically.
  // At this point, we can close it manually since we have all the output
  // we need.
  proc.close();

  return {
    result,
    success: result.success,
    code:    result.code,
    stdout:  s_o,
    stderr:   s_e,
    process: proc
  };
} // export
