
import {split_whitespace} from "../src/String.ts";

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

export async function run(arr: string | string[]) {
  const proc = Deno.run({
    cmd: string_to_array(arr),
    stderr: "piped",
    stdout: "piped"
  });
  const status = await proc.status();
  const s_o = new TextDecoder().decode(await proc.output());
  const s_e = new TextDecoder().decode(await proc.stderrOutput());

  // NOTE: For some reason, the process is never closed automatically.
  // At this point, we can close it manually since we have all the output
  // we need.
  proc.close();

  return {
    status,
    success: status.success,
    code:    status.code,
    stdout:  s_o,
    stderr:  s_e,
    process: proc
  };
} // export
