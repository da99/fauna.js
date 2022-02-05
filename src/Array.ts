
import {split_whitespace} from "./String.ts";

export function unique_text(arr: string[]) : string[] {
  const o = {} as Record<string, boolean>;
  const new_lines = [] as string[];
  for(const l of arr) {
    const trim = l.trim();
    if (trim.length === 0) {
      new_lines.push(l);
      continue;
    }
    const unique = l.replaceAll(/\s+/g, "");
    if (o[unique])
      continue;
    o[unique] = true;
    new_lines.push(l);
  }
  return new_lines;
} // export function
