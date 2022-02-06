

import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";


// // =============================================================================
describe("Spec");

it("passes on deep equality.", ()=>{
  EQUALS({a: "a"},{a: "a"});
});

it("fails on deep in-equality.", ()=>{
  EQUALS({a: "a"},{b: "a"});
});

it("accepts async functions.", async () => {
  const result = await Promise.resolve("pass");
  EQUALS("pass", result);
});


// export { };
