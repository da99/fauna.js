
export const WHITESPACE_PATTERN = /\s+/

function trim(x: string) {
  return x.trim();
} // function

function length_not_zero(x: String | Array<any>) {
  return x.length != 0;
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

export function split_join(str: string, join?: string) {
  return split_whitespace(str).join(join || " ");
} // function

export function each_block(body: string, raw_begin: string, raw_end: string, f?: (x: string) => void) {
  const begin = split_whitespace(raw_begin);
  const end = split_whitespace(raw_end);
  const join = "\\s+";
  const reg = new RegExp(`${begin.join(join)}(.+?)${end.join(join)}`, "gms");
  const results = body.matchAll(reg);
  const match_pairs = [...results];
  const matches: string[] = [];
  for (const [block, inner] of match_pairs) {
    matches.push(inner);
    f && f(inner);
  }
  return matches;
} // function

