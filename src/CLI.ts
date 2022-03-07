

import * as path from "https://deno.land/std/path/mod.ts";
import { bold, green, yellow, blue } from "https://deno.land/std/fmt/colors.ts";
// import { split_whitespace } from "./String.ts";

// const WHITESPACE = /(\s+)/;

// function standard_keys(raw : string) {
//   return raw.split(WHITESPACE).filter((e) => e !== "" );
// }

export function inspect(x: any) {
  return Deno.inspect(
    x,
    {compact: true, showHidden: false, depth: Infinity, colors: true}
  );
} // export

export function raw_inspect(x: any) {
  return Deno.inspect(
    x,
    {
      compact: true,
      showHidden: false,
      depth: Infinity,
      colors: false
    }
  );
} // export

type Action = (...args: string[]) => void;
type Pattern_Element = string | 0 | string[];
type Pattern = Array<Pattern_Element>;

interface Command {
  raw_cmd: string;
  pattern: Array<Pattern_Element>;
  action: Action;
} // interface

/*
 * 0 = grab any value.
 */
export function get_vars(raw_cmd: string, input: string[]) {
  const pattern = split_cli_command(raw_cmd).map((x: string) => {
    if (x.indexOf('<') === 0 && x.indexOf('>') === (x.length - 1)) {
      if (x.indexOf('|') > 1) {
        return x.substring(1, x.length - 1).split('|').map(x => x.trim());
      }
      if (x === "<...args>") {
        return x;
      }
      return 0;
    }
    if (x.indexOf('[') === 0 && x.indexOf(']') === (x.length - 1)) {
      if (x === "[...args]") {
        return x;
      }
      return 0;
    }
    return x;
  }); // pattern

  const vars: Array<string | string[]> = [];
  const used_inputs: string[] = [];
  const is_a_match = pattern.every((x, i) => {
    const u = input[i];
    if (x === u ) { used_inputs.push(u); return true; }
    if (x === 0) {
      used_inputs.push(u);
      vars.push(u);
      return true;
    }
    if (x === "<...args>" || x === "[...args]") {
      const args = input.slice(i);
      if (x === "<...args>" && args.length === 0) {
        return false;
      }
      used_inputs.push(...args)
      vars.push(args);
      return true;
    }
    if (Array.isArray(x) && x.includes(u)) {
      used_inputs.push(u)
      vars.push(u);
      return true
    }
  });

  if (used_inputs.length != input.length) {
    return false;
  }

  if (is_a_match)
    return vars;

  return false;
} // function

let _user_input: string[] = [];
let _vars: Array<string | string[]> = [];
let is_found = false;
let is_help = false;
let filename = path.basename(import.meta.url);
let _cmd_name: string = path.basename(Deno.mainModule);

command(Deno.args);

export function cmd_name(s?: string) {
  if (s) {
    _cmd_name = s;
  }
  return _cmd_name;
} // export

export function values() {
  return _vars;
} // export

export function command(i: string[]) {
  _user_input = i;
  switch(_user_input[0]) {
    case "-h":
      case "help":
      case "--help": {
      is_help = true;
      break;
    }
    default:
      is_help = false;
  } // switch
} // export

export function print_help(raw_cmd: string) {
  const search = _user_input[1];
  if (search && raw_cmd.indexOf(search) === -1) {
    return false;
  }

  const pieces = split_cli_command(raw_cmd).map((x, i) => {
    if (i === 0)
      return bold(blue(x));
    if (x.indexOf('|') > 0)
      return yellow(x);
    if (x.indexOf('<') > -1)
      return green(x);
    return x;
  });
  console.log(`  ${cmd_name()} ${pieces.join(" ")}`);
  return true;
} // export

export function match(pattern: string) {
  if (is_help) {
    print_help(pattern);
  } // if is_help

  if (is_found)
    return false;

  const new_vars = get_vars(pattern, _user_input);

  if (new_vars) {
    _vars = new_vars;
    is_found = true;
  }
  return !!new_vars;
} // function

export function not_found() {
  match("help|--help|-h [search]");
  if (is_found || is_help)
    return false;
  console.error(`Command not recognized: ${_user_input.map(x => Deno.inspect(x)).join(" ")}`);
  Deno.exit(1);
}

export function split_cli_command(raw_s: string) : Array<string> {
  const s = raw_s.trim().replace(/\s+/g, " ");
  const words: Array<string> = [];
  let current_bracket: null | string = null;
  let current_word: string[] = [];
  let next_char: undefined | string = "";
  let last_was_open_bracket = false;
  let next_is_closing_bracket = false;
  let last_was_pipe = false;
  let next_is_pipe = false;
  let last_c = "";

  let i = -1;
  let fin = s.length - 1;
  for (const c of s) {
    ++i;
    next_char = s.charAt(i+1);
    next_is_closing_bracket = next_char === ']' || next_char === '>';
    next_is_pipe = next_char === '|'
    switch (c) {
      case "[":
      case "<": {
        current_bracket = c;
        current_word = [c];
        break;
      }

      case ">":
      case "]": {
        current_word.push(c);
        current_bracket = null
        const new_word = current_word.join("");
        if (i !== fin && (new_word === "<...args>" || new_word === "[...args]")) {
          throw new Error(`${new_word} has to be the last element in the pattern: ${s}.`);
        }
        words.push(new_word);
        current_word = [];
        break;
      }

      case " ": {
        if (current_bracket) {
          if (!last_was_pipe && !next_is_pipe && !last_was_open_bracket && !next_is_closing_bracket && last_c !== c) {
            current_word.push(c);
          }
        } else {
          if (current_word.length !== 0) {
            words.push(current_word.join(""));
            current_word = [];
          }
        }
        break;
      }

      default:
        current_word.push(c);
        if (i === fin) {
          words.push(current_word.join(""));
          current_word = [];
        }
    } // switch
    last_c = c;
    last_was_open_bracket = last_c === '[' || last_c === '<';
    last_was_pipe = last_c === '|'
  } // for
  return words; // .map(x => x.replace(/\s*\|\s*/g, "|"));
} // function


