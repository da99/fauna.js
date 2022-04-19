import { describe, it, equals, matches } from "../src/Spec.ts";
import {
  lines, columns,
  Lines, Columns,
  fd, find,
} from "../src/Shell.ts";

import {
  UP_CASE,
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
  const c2 = columns([["a", 2, 3], ["b",5,6], ["c",8,9]]).cell("first", UP_CASE);
  equals(c2.raw[0][0], "A");
});

it("alters the last value of the last row.", function () {
  const c2 = columns([["a", 2, 3], ["b",5,6], ["c",8,"last"]]).cell("first", UP_CASE);
  equals(c2.raw[2][2], "last");
});


// =============================================================================
describe("Columns#push_value");
// =============================================================================

it("can insert the same value as a top row.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_value("top", "a");
  equals(c2.raw, ["a a a".split(' '), [1, 2, 3], [4,5,6], [7,8,9]]);
});

it("can insert the same value as a bottom row.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_value("bottom", "a");
  equals(c2.raw, [[1, 2, 3], [4,5,6], [7,8,9], "a a a".split(' ') ]);
});

it("can insert the same value as a column to the right.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_value("right", "a");
  equals(c2.raw, [[1, 2, 3, "a"], [4,5,6, "a"], [7,8,9, "a"] ]);
});

it("can insert the same value as a column to the left.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_value("left", 0);
  equals(c2.raw, [[0, 1, 2, 3], [0, 4,5,6], [0, 7,8,9] ]);
});

// =============================================================================
describe("Columns#push_function");
// =============================================================================

it("can insert the returned value as a top row.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]])
  .push_function("top", (info) => `${info.count} ${info.first} ${info.last}`);
  equals(c2.raw, [["0 true false", "1 false false", "2 false true"], [1, 2, 3], [4,5,6], [7,8,9]]);
});

it("can insert the same returned value as a bottom row.", function () {
  let vals = "a b c".split(' ');
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_function("bottom", () => vals.pop());
  equals(c2.raw, [[1, 2, 3], [4,5,6], [7,8,9], "c b a".split(' ') ]);
});

it("can insert the same returned value as a column to the right.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_function("right", () => 0);
  equals(c2.raw, [[1, 2, 3, 0], [4,5,6, 0], [7,8,9, 0] ]);
});

it("can insert the same returned value as a column to the left.", function () {
  const c2 = columns([[1, 2, 3], [4,5,6], [7,8,9]]).push_function("left", () => "start");
  equals(c2.raw, [["start", 1, 2, 3], ["start", 4,5,6], ["start", 7,8,9] ]);
});

// =============================================================================
describe("Columns#push_column");
// =============================================================================

it("can insert columns: top.", function () {
  const c1 = columns([[1, 2, 3], [4,5,6]]);
  const c2 = columns([[7,8,9]]);
  const c3 = c2.push_columns("top", c1);
  equals(c3.raw, [
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]);
});

it("can insert columns: bottom.", function () {
  const c1 = columns([[1, 2, 3], [4,5,6]]);
  const c2 = columns([[7,8,9]]);
  const c3 = c2.push_columns("bottom", c1);
  equals(c3.raw, [
    [7,8,9],
    [1,2,3],
    [4,5,6],
  ]);
});

it("can insert columns: right.", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6]
  ]);
  const c2 = columns([
    [7,8,9],
    [10,11,12]
  ]);
  const c3 = c2.push_columns("right", c1);
  equals(c3.raw, [
    [7,8,9, 1,2,3],
    [10,11,12, 4,5,6]
  ]);
});

it("can insert columns: left.", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6]
  ]);
  const c2 = columns([
    [7,8,9],
    [10,11,12]
  ]);
  const c3 = c2.push_columns("left", c1);
  equals(c3.raw, [
    [1,2,3, 7,8,9],
    [4,5,6, 10,11,12]
  ]);
});

it("throws an error if the row counts are unequal.", function () {
  const c1 = columns([ [1,2,3], [4,5,6] ]);
  const c2 = columns([ [7,8,9] ]);
  let msg = "no error thrown";
  try {
    c1.push_columns("left", c2);
  } catch (e) {
    msg = e.message;
  }
  matches(msg, /row count mis-match/i, msg);
});


// =============================================================================
describe("Columns#head")
// =============================================================================

it("returns the number of specified columns from the left side", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]);
  const c2 = c1.head(1, "column");
  equals(c2.raw, [[1],[4],[7]]);
});

it("returns the number of specified rows from the top side", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]);
  const c2 = c1.head(2, "row");
  equals(c2.raw, [
    [1,2,3],
    [4,5,6]
  ]);
});

// it("returns all but the last negative n columns: head(-1, 'column')", function () {
//   const c1 = columns([
//     [1,2,3],
//     [4,5,6],
//     [7,8,9]
//   ]);
//   const c2 = c1.head(-1, "column");
//   equals(c2.raw, [
//     [1,2],
//     [4,5],
//     [7,8]
//   ]);
// });

// it("returns all but the last negative n rows: head(-1, 'row')", function () {
//   const c1 = columns([
//     [1,2,3],
//     [4,5,6],
//     [7,8,9],
//     ["a", "b", "c"]
//   ]);
//   const c2 = c1.head(-2, "row");
//   equals(c2.raw, [
//     [1,2,3],
//     [4,5,6],
//   ]);
// });

// =============================================================================
describe("Columns#tail")
// =============================================================================

it("returns the number of specified columns from the right side", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]);
  const c2 = c1.tail(1, "column");
  equals(c2.raw, [[3],[6],[9]]);
});

it("returns the number of specified rows from the bottom side", function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]);
  const c2 = c1.tail(2, "row");
  equals(c2.raw, [
    [4,5,6],
    [7,8,9]
  ]);
});

// it("returns all but the last negative n columns: tail(-1, 'column')", function () {
//   const c1 = columns([
//     [1,2,3,4],
//     [4,5,6,7],
//     [7,8,9,10]
//   ]);
//   const c2 = c1.tail(-2, "column");
//   equals(c2.raw, [
//     [3,4],
//     [6,7],
//     [9,10]
//   ]);
// });

// it("returns all but the last negative n rows: tail(-1, 'row')", function () {
//   const c1 = columns([
//     [1,2,3],
//     [4,5,6],
//     [7,8,9],
//     ["a", "b", "c"]
//   ]);
//   const c2 = c1.tail(-2, "row");
//   equals(c2.raw, [
//     [7,8,9],
//     ["a", "b", "c"]
//   ]);
// });

// =============================================================================
describe("Columns#middle")
// =============================================================================

it('returns a row without the specified quantity from the top: middle(2,0, "row")', function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9],
    ["a", "b", "c"]
  ]);
  const c2 = c1.middle(2,0, "row");
  equals(c2.raw, [
    [7,8,9],
    ["a", "b", "c"]
  ]);
});

it('returns a row without the specified quantity from the bottom: middle(2,2, "row")', function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [10,11,12],
    [13,14,15],
  ]);
  const c2 = c1.middle(2,2, "row");
  equals(c2.raw, [
    [7,8,9],
  ]);
});

it('returns Columns without the specified quantity from the left: middle(2,0, "column")', function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9],
    ["a", "b", "c"]
  ]);
  const c2 = c1.middle(2,0, "column");
  equals(c2.raw, [
    [3],
    [6],
    [9],
    ["c"]
  ]);
});

it('returns a row without the specified quantity from the right: middle(0,2, "column")', function () {
  const c1 = columns([
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [10,11,12],
    [13,14,15],
  ]);
  const c2 = c1.middle(0,2, "column");
  equals(c2.raw, [
    [1,],
    [4,],
    [7,],
    [10],
    [13],
  ]);
});
