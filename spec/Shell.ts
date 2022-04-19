import { describe, it, equals } from "../src/Spec.ts";
import {
  lines, columns,
  Lines, Columns,
  fd, find,
} from "../src/Shell.ts";

import {
  is_number,
  is_length_0,
  is_null_or_undefined,
  not, UP_CASE,
  pipe_function
} from "../src/Function.ts";

// =============================================================================
describe("fd");
// =============================================================================

it("returns a row", async () => {
  const actual = (await fd(`.ts$ src --max-depth 1`))
  equals(actual.constructor, Lines);
})

it("turns the output into values in the row", async () => {
  const actual = (await fd(`.ts$ src --max-depth 1`)).filter(x => x === "src/Shell.ts").raw
  equals(actual, ["src/Shell.ts"]);
})

// =============================================================================
describe("find");
// =============================================================================
it("returns Lines", async () => {
  const actual = (await find(`src -maxdepth 1 -name *.ts`)).constructor
  equals(actual, Lines);
})

// =============================================================================
describe("Lines#filter");
// =============================================================================

it("removes values if callback returns true", function () {
  const actual = lines("a b c".split(' ')).filter(s => s !== 'a');
  const expect = ["b", "c"];

  equals(actual.raw, expect);
});

// =============================================================================
describe("Lines#remove");
// =============================================================================

it("removes values if condition is true", function () {
  const actual = lines("a b c".split(' ')).remove(s => s === "b");
  equals(actual.raw, ["a", "c"]);
});

it("keeps values if condition is false", function () {
  const actual = lines("d e f".split(' ')).remove(s => s === "z");
  equals(actual.raw, ['d', 'e', 'f']);
});

// =============================================================================
describe("Lines#promise_all");
// =============================================================================

it("returns a Promise", async function () {
  const actual = lines("1\n2\n3")
  .promise_all(pipe_function(parseInt, (x: number) => Promise.resolve(x)))
  ;
  const expect = [1, 2, 3];

  equals((await actual), expect);
});


it("returns a Promise.all", async function () {
  const actual = lines("4\n5\n6").promise_all((x: string) => Promise.resolve(parseInt(x)));
  const expect = [4, 5, 6];

  equals((await actual), expect);
});

// =============================================================================
describe("Lines#split");
// =============================================================================

it("returns Columns", () => {
  const x = "a-1 b-2 c-3 d-4".split(' ');
  const actual = lines(x).split('-');
  equals(actual.constructor, Columns)
});

it("splits each value into another array", function () {
  const x = "a-1 b-2 c-3 d-4".split(' ');
  const actual = lines(x).split('-');
  const expect = [["a", "1"], ["b", "2"], ["c", "3"], ["d", "4"]];

  equals(actual.raw, expect);
});


// =============================================================================
// Columns:
// =============================================================================

// =============================================================================
describe("Columns#filter_rows");
// =============================================================================

it("keeps rows when callback returns true", function () {
  const x = columns( [ [1, 2, 3], ["a", "b", "c"], [4,5,6] ]);

  const actual = x.filter_rows(x=> typeof x[0] !== 'string');

  equals(actual.raw, [ [1,2,3], [4,5,6] ]);
});


// =============================================================================
describe("Columns#remove_rows");
// =============================================================================

it("removes rows if callback returns true", function () {
  const x = columns([
    [1, 2, null],
    [3,4,5],
    [5,6,7]
  ]);

  const actual = x.remove_rows(row => row.includes(null));

  equals(actual.raw, [ [3,4,5], [5,6,7] ]);
});

// =============================================================================
describe("Columns#column");
// =============================================================================

it("operates on the value of the specified column", function () {
  const x = columns([[1, 2, 3], [4,5,6], [7,8,9]]);

  const actual = x
  .column(2, x => x + 10);

  equals(actual.raw, [ [1, 2, 13], [4,5,16], [7,8,19] ]);
});

it("throws an Error if value is less than 0", function () {
  const x = columns([[1, 2, 3], [4,5,6], [7,8,9]]);
  let actual = {message: ""};
  try {
    x.column(-1, x => x + 10);
  } catch (e) {
    actual = e;
  }

  equals(actual.message.indexOf("Invalid value for column index"), 0, actual.message);
});

// =============================================================================
describe("Columns#cell");
// =============================================================================

it("alters the first value of the first row.", function () {
  const c = columns([["a", 2, 3], ["b",5,6], ["c",8,9]]);
  c.cell("first", UP_CASE);
  equals(c.raw[0][0], "a");
});

