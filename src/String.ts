
export const WHITESPACE_PATTERN = /\s+/

function trim(x: string) {
  return x.trim();
} // function

function length_not_zero(x: String | Array<any>) {
  return x.length != 0;
} // function

export function split_cli_command(s: string) : Array<string> {
  const words: Array<string> = [];
  let current_bracket: null | string = null;
  let current_word: string[] = [];
  let last_c = "";

  let i = -1;
  let fin = s.length - 1;
  for (const c of s) {
    ++i;
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
        words.push(current_word.join(""));
        current_word = [];
        break;
      }

      case " ": {
        if (current_bracket) {
          if (last_c !== c) {
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
  } // for
  return words;
} // function

export function split_whitespace(x: string) {
  // The .split method call will not create any null values in the
  // returned array. So no need to filter out null values.
  // We just need to filter out empty strings.
  return x
  .split(WHITESPACE_PATTERN)
  .map(trim)
  .filter(length_not_zero);
} // function

export function compact_lines(x: string, n: number) : string {
  return x.replaceAll(new RegExp(`\\n{${n},}`, "g"), "\n");
} // function

// Adds lines of b into a, only if characters other than whitespace
//   are different.
//   " a " + "a" = " a "
export function split_join(str: string, join?: string) {
  return split_whitespace(str).join(join || " ");
} // function

export function each_block(body: string, raw_begin: string, raw_end: string, f?: (x: string) => void) {
  const begin = split_whitespace(raw_begin);
  const end = split_whitespace(raw_end);
  const join = "\\s+";
  const reg = new RegExp(`${begin.join(join)}\\s+(.+?)\\s+${end.join(join)}`, "gms");
  const results = body.matchAll(reg);
  const match_pairs = [...results];

  const matches: string[] = [];
  for (const [block, inner] of match_pairs) {
    matches.push(inner);
    f && f(inner);
  }

  return matches;
} // function

