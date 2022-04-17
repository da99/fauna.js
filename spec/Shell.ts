import { describe, it, equals } from "../src/Spec.ts";
import {
  row, columns,
  Row, Columns,
  fd, find, arrays_to_columns,
} from "../src/Shell.ts";

import {
  is_number,
  is_length_0,
  is_null_or_undefined,
  not,
} from "../src/Function.ts";

// =============================================================================
describe("arrays_to_columns");
// =============================================================================

it("combines arrays into columns", () => {
  const actual = arrays_to_columns(
    [1,2,3], "a b c".split(' '), ["n","b","c"]
  );
  equals(actual.raw, [[1, "a", "n"],[2, "b", "b"],[3, "c", "c"]]);
});

it("combines arrays with unequal lengths", () => {
  const actual = arrays_to_columns(
    [1,2], "a b c".split(' '), [false]
  );
  equals(actual.raw, [[1, "a", false],[2, "b"],["c"]]);
});

// =============================================================================
describe("fd");
// =============================================================================

it("returns a row", async () => {
  const actual = (await fd(`.ts$ src --max-depth 1`))
  equals(actual.constructor, Row);
})

it("turns the output into values in the row", async () => {
  const actual = (await fd(`.ts$ src --max-depth 1`)).filter(x => x === "src/Shell.ts").raw
  equals(actual, ["src/Shell.ts"]);
})

// =============================================================================
describe("find");
// =============================================================================
it("returns a row", async () => {
  const actual = (await find(`src -maxdepth 1 -name *.ts`)).constructor
  equals(actual, Row);
})

// =============================================================================
describe("Rows#filter");
// =============================================================================

it("removes nulls and undefineds", function () {
  const actual = row([1, null, 2, undefined, 3]).filter(not(is_null_or_undefined));
  const expect = [1, 2, 3];

  equals(actual.raw, expect);
});

// =============================================================================
describe("Rows#remove");
// =============================================================================

it("removes values if condition is true", function () {
  const actual = row([1, null, 2, undefined, 3]).remove(is_null_or_undefined);
  const expect = [1, 2, 3];

  equals(actual.raw, expect);
});

it("keeps values if condition is false", function () {
  const actual = row([1, null, 2, undefined, 3]).remove(is_number);
  equals(actual.raw, [null, undefined]);
});

// =============================================================================
describe("Rows#promise_all");
// =============================================================================

it("returns a Promise", async function () {
  const actual = row("1 2 3".split(' '))
  .map(parseInt, (s: number) => Promise.resolve(s))
  .promise_all()
  ;
  const expect = [1, 2, 3];

  equals((await actual), expect);
});


it("returns a Promise.all", async function () {
  const actual = row("4 5 6".split(' ')).map((x: string) => Promise.resolve(parseInt(x))).promise_all();
  const expect = [4, 5, 6];

  equals((await actual), expect);
});

// =============================================================================
describe("Rows#cut");
// =============================================================================

it("returns Columns", () => {
  const x = "a-1 b-2 c-3 d-4".split(' ');
  const actual = row(x).cut('-');
  equals(actual.constructor, Columns)
});

it("cuts each value into another array", function () {
  const x = "a-1 b-2 c-3 d-4".split(' ');
  const actual = row(x).cut('-');
  const expect = [["a", "1"], ["b", "2"], ["c", "3"], ["d", "4"]];

  equals(actual.raw, expect);
});

it("re-arranges columns", function () {
  const x = "a-1 b-2 c-3 d-4".split(' ');
  const actual = row(x).cut('-', 1, 0);
  const expect = [
    ["1", "a"],
    ["2", "b"],
    ["3", "c"],
    ["4", "d"]
  ];

  equals(actual.raw, expect);
});

// =============================================================================
// Columns:
// =============================================================================

// =============================================================================
describe("Columns#filter_cells");
// =============================================================================

it("removes nulls and undefines in each cell", function () {
  const x = columns( [ [1, 2, null], [3, null, 4, undefined], [null, 5, 6] ]);
  const actual = x.filter_cells(not(is_null_or_undefined));
  const expect = [ [1, 2], [3, 4], [5, 6] ];
  equals(actual.raw, expect);
});

// =============================================================================
describe("Columns#filter_rows");
// =============================================================================

it("removes empty rows", function () {
  const x = columns< null | number | undefined>( [ [1, 2, null], [undefined], [], [null, undefined] ]);

  const actual = x
  .filter_cells(not(is_null_or_undefined))
  .filter_rows(not(is_length_0));

  const expect = [ [1, 2] ];
  equals(actual.raw, expect);
});

// =============================================================================
describe("Columns#remove_cells");
// =============================================================================

it("removes nulls and undefines in each cell", function () {
  const x = columns( [ [1, 2, null], [3, null, 4, undefined], [null, 5, 6] ]);
  const actual = x.remove_cells(is_null_or_undefined);
  const expect = [ [1, 2], [3, 4], [5, 6] ];
  equals(actual.raw, expect);
});

// =============================================================================
describe("Columns#remove_rows");
// =============================================================================

it("removes empty rows", function () {
  const x = columns<null | number | undefined>( [ [1, 2, null], [undefined], [], [null, undefined] ]);

  const actual = x
  .remove_cells(is_null_or_undefined)
  .remove_rows(is_length_0);

  const expect = [ [1, 2] ];
  equals(actual.raw, expect);
});
