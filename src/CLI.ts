


import {split_whitespace} from "./String.ts";

// // Colors from: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
// const DA_Spec = {
//   "BOLD" : "\x1b[1m",
//   "RED": "\x1b[31m",
//   "GREEN": "\x1b[32m",
//   "YELLOW": "\x1b[33m"
// }; // const
// const RESET = "\x1b[0m";

// const WHITESPACE = /(\s+)/; 

// function standard_keys(raw : string) {
//   return raw.split(WHITESPACE).filter((e) => e !== "" );
// }

// function color(color, ...args) {
//   const new_color = standard_keys(color).map((x) => DA_Spec[x]).join(" ");
//   return `${new_color}${args.join(" ")}${RESET}`;
// }

// function bold(txt) {
//   return color("BOLD", txt);
// }

// function green(txt) {
//   return color("GREEN", txt);
// }

// function red(txt) {
//   return color("RED", txt);
// }

// function yellow(txt) {
//   return color("YELLOW", txt);
// }

// green.bold  = function (...args) { return color("GREEN BOLD", args); };
// red.bold    = function (...args) { return color("RED BOLD", args); };
// yellow.bold = function (...args) { return color("YELLOW BOLD", args); };

// export function it(name, f) {

//   try {
//     f();
//     console.error(bold("  - ") + green.bold("✓ " + name));
//   } catch (err) {
//     console.error(bold("  - ") + red.bold("✗ " + name));
//     throw err;
//   }
// } // function
type Action = (...args: string[]) => void;
type Pattern_Element = string | 0;

interface Command {
  raw_cmd: string;
  pattern: Array<Pattern_Element>;
  action: Action;
} // interface

function arg_match(pattern: Array<Pattern_Element>, user_input: string[]) {
  if (pattern.length !== user_input.length)
    return false;
  const vars: string[] = [];
  const is_a_match = pattern.every((x, i) => {
    const u = user_input[i];
    if (x === u ) { return true; }
    if (x === 0) {
      vars.push(u);
      return true;
    }
    return false;
  });
  if (is_a_match)
    return vars;
  return false;
} // function

export class CLI {
  cmds: Command[];

  constructor() {
    this.cmds = [];
  } // constructor

  on(raw_cmd: string, action: Action) {
    this.cmds.push({
      raw_cmd,
      action,
      pattern: split_whitespace(raw_cmd).map((x: string) => {
        if (x.indexOf('<') === 0 && x.indexOf('>') === (x.length - 1))
          return 0;
        return x;
      })
    });
    return this;
  } // method

  run(user_input?: string[]) {
    const input = user_input || Deno.args;

    const cmd_found = this.cmds.find((cmd) => {
      const vars = arg_match(cmd.pattern, input);
      if (!vars)
        return false;
      cmd.action(...vars);
      return true;
    });

    if (!cmd_found) {
      console.error(`Command not reconized: ${input.map(x => Deno.inspect(x)).join(" ")}`);
      Deno.exit(1);
    }
  } // method
} // export class

export const cli = new CLI();

