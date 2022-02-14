import { describe, it } from "../src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";
import {
  Role
} from "../src/FaunaDB.ts";


// # =============================================================================
describe("deepEqual(x, y)");

it("returns true if two FQL objects have the same values", function () {
  assertEquals(
    deepEqual(
      Role("123"),
      Role("123")
    ),
    true
  );
}); // it function

it("returns true if two Records have Expr with same values", function () {
  const x = {a: Role("hello1")};
  const y = {a: Role("hello1")};
  assertEquals(deepEqual(x, y), true);
}); // it function

it("returns false if two FQL objects are different", () => {
  const actual = deepEqual(
    Role("123"),
    Role("234")
  );
  assertEquals(actual, false);
});

it("returns true if a Record has the same values of a Expr", function () {
  const e = Role("123");
  const r = {name: "Role", id: "123"};
  assertEquals(deepEqual(e, r), true);
}); // it function

