import { Spec, spec, describe, it, State } from "../src/Spec.ts";
import { split_whitespace, each_block, split_join } from "../src/String.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";

describe("String split_whitespace");

it("removes whitespace from beginning, middle, and end", function () {
  const str = "  a  \r\n \t b    c ";
  const actual = split_whitespace(str);
  EQUALS(actual, "a b c".split(" "));
}); // it

describe("String each_block");

it("gets the body of the inner block", () => {
  const actual = each_block(`
  > start
  a
  b
  c
  < end
  `, "> start", "< end");
  EQUALS("a b c", split_join(actual.join(" ")))
}); // it

it("ignores whitespace of the surrounding substrings.", () => {
  const actual = each_block(`
  >   > start
  1 2 3  < < end
  `, "> > start", "<  <  end");
  EQUALS("1 2 3", actual.join(" ").trim());
}); //it

it("calls the callback for each block", () => {
  const actual: Array<string> = [];
  each_block(`
  >   > start 1 2 3  < < end
  >   > start 4 5 6  < < end
  `, "> > start", "<  <  end", (block: string) => actual.push(block));
  EQUALS("1 2 3 4 5 6", split_join(actual.join(" ")));
});

await spec.run_last_fail("tmp/spec.fail.txt");
spec.print();
spec.exit_on_fail();
