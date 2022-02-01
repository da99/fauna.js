import { Spec, spec, describe, it, State } from "../src/Spec.ts";
import { split_whitespace } from "../src/String.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";

describe("String split_whitespace");

it("removes whitespace from beginning, middle, and end", function () {
  const str = "  a  \r\n \t b    c ";
  const actual = split_whitespace(str);
  EQUALS(actual, "a b c".split(" "));
}); // it

await spec.run_last_fail("tmp/spec.fail.txt");
spec.print();
spec.exit_on_fail();
