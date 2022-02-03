import { spec, describe, it } from "https://raw.githubusercontent.com/da99/da.ts/main/src/Spec.ts";
import { split_whitespace, each_block, split_join } from "https://raw.githubusercontent.com/da99/da.ts/main/src/String.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import { Name } from "../src/Name.ts";

describe("Name");

it("does something", () => {
  const actual = new Name();
  EQUALS("", actual);
});

await spec.run_last_fail("tmp/last.spec.fail.txt");
spec.print();
spec.exit_on_fail();
