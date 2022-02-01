
const WHITESPACE_PATTERN = /\s+/

function trim(x: string) {
  return x.trim();
} // function

function length_not_zero(x: String | Array<any>) {
  return x.length != 0;
} // function

function split_whitespace(x: string) {
  // The .split method call will not create any null values in the
  // returned array. So no need to filter out null values.
  // We just need to filter out empty strings.
  return x
  .split(WHITESPACE_PATTERN)
  .map(trim)
  .filter(length_not_zero);
} // function

export { split_whitespace, WHITESPACE_PATTERN};
