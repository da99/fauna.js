import { describe, it, equals } from "../src/Spec.ts";

import {
  head, tail, rearrange
} from "../src/Array.ts";

// =============================================================================
describe("rearrange");
// =============================================================================

it("returns an array with re-arranged contents", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = rearrange(x, [3,0, head(2), tail(2)]);
  const expect = ["3", "0", "0", "1", "5", "6"];

  equals(actual, expect);
});

it("returns an array with head: head(n)", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = rearrange(x, [head(4)]);
  const expect = "0 1 2 3".split(' ')

  equals(actual, expect);
});

it("returns an array with tail: tail(n)", function () {
  const x = "0 1 2 3 4 5 6".split(/\s+/);
  const actual = rearrange(x, [tail(3)]);
  const expect = "4 5 6".split(' ')

  equals(actual, expect);
});

