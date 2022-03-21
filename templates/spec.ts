import { describe, it } from "DA_PATH/src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { {Name} } from "../src/{Name}.ts";

describe("{Name}");

it("does something", () => {
  const actual = new {Name}();
  assertEquals("", actual);
});

