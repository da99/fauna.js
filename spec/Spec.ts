

import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";


// // =============================================================================
describe("Spec");

it("passes on deep equality.", ()=>{
  EQUALS({a: "a"},{a: "a"});
});

it("fails on deep in-equality.", ()=>{
  const expect_name = "AssertionError";
  let actual_name = "";
  try {
  EQUALS({a: "a"},{b: "a"});
  } catch (e) {
    actual_name = e.name;
  }
  EQUALS(expect_name, actual_name);
});

it("accepts async functions.", async () => {
  const result = await Promise.resolve("pass");
  EQUALS("pass", result);
});


// export { };
