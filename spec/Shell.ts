import { describe, it, equals } from "../src/Spec.ts";
import {
  split_whitespace, rows, columns,
  Rows, Columns,
  head, tail, arrange_columns, merge_columns
} from "../src/Shell.ts";

// =============================================================================
describe("Shell.ts merge_columns");
// =============================================================================

it("combines arrays into columns", () => {
  const actual = merge_columns(
    [1,2,3], "a b c".split(' ')
  );
  equals(actual.value, [[1, "a"],[2, "b"],[3, "c"]]);
});

it("combines arrays with unequal lengths", () => {
  const actual = merge_columns(
    [1,2], "a b c".split(' '), [false]
  );
  equals(actual.value, [[1, "a", false],[2, "b"],["c"]]);
});

// =============================================================================
describe("Shell.ts split_whitespace");
// =============================================================================

it("splits the value", () => {
  const actual = split_whitespace("e n d").value;
  equals(actual, ["e", "n", "d"]);
});

it("splits the value, ignoreding whitespace at the beginning/end.", () => {
  const actual = split_whitespace("  e n d  \t ").value;
  equals(actual, ["e", "n", "d"]);
});

it("returns a Rows instance", () => {
  const actual = split_whitespace("e n d");
  equals(actual.constructor, Rows);
});

// =============================================================================
describe("Shell.ts arrange_columns");
// =============================================================================

it("returns an array with re-arranged contents", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = arrange_columns(x, [3,0, head(2), tail(2)]);
  const expect = ["3", "0", "0", "1", "5", "6"];

  equals(actual, expect);
});

it("returns an array with head: head(n)", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = arrange_columns(x, [head(4)]);
  const expect = "0 1 2 3".split(' ')

  equals(actual, expect);
});

it("returns an array with tail: tail(n)", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = arrange_columns(x, [tail(3)]);
  const expect = "4 5 6".split(' ')

  equals(actual, expect);
});


// =============================================================================
describe("Shell.ts Rows#compact");
// =============================================================================

it("removes nulls and undefineds", function () {
  const actual = rows([1, null, 2, undefined, 3]).compact();
  const expect = [1, 2, 3];

  equals(actual.value, expect);
});

// =============================================================================
describe("Shell.ts Rows#map_promise_all");
// =============================================================================

it("maps each value to a Promise", async function () {
  const actual = split_whitespace(" 1 2 3 ").update(parseInt).map_promise_all(
    s => Promise.resolve(s)
  );
  const expect = [1, 2, 3];

  equals(await actual, expect);
});

// =============================================================================
describe("Shell.ts Rows#promise_all");
// =============================================================================

it("returns a Promise.all", async function () {
  const actual = split_whitespace(" 4 5 6 ").update(x => Promise.resolve(parseInt(x))).promise_all();
  const expect = [4, 5, 6];

  equals(await actual, expect);
});

// =============================================================================
describe("Shell.ts Rows#cut_columns");
// =============================================================================

it("cuts each value into another array", function () {
  const x = "a-1 b-2 c-3 d-4";
  const actual = split_whitespace(x).cut_columns('-');
  const expect = [["a", "1"], ["b", "2"], ["c", "3"], ["d", "4"]];

  equals(actual.value, expect);
});

it("re-arranges columns", function () {
  const x = "a-1 b-2 c-3 d-4";
  const actual = split_whitespace(x).cut_columns('-', 1, 0);
  const expect = [
    ["1", "a"],
    ["2", "b"],
    ["3", "c"],
    ["4", "d"]
  ];

  equals(actual.value, expect);
});

// =============================================================================
// Columns:
// =============================================================================
describe("Shell.ts Columns#compact");

it("removes nulls and undefines in each cell", function () {
  const x = columns( [ [1, 2, null], [3, null, 4, undefined], [null, 5, 6] ]);
  const actual = x.compact();
  const expect = [ [1, 2], [3, 4], [5, 6] ];
  equals(actual.value, expect);
});

it("removes empty rows and rows of nulls and undefineds.", function () {
  const x = columns( [ [1, 2, null], [undefined], [], [null, undefined] ]);

  const actual = x.compact();
  const expect = [ [1, 2] ];
  equals(actual.value, expect);
});
