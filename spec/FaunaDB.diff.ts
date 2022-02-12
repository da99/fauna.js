import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import {
  equals as fql_equals, Role, Ref,
  remove_key,
  standardize,
//   drop_schema, diff,schema, query,
  CreateCollection, Collection, Collections,
//   If, Exists,
//   delete_if_exists, collection_names
} from "../src/FaunaDB.ts";
// import type {Expr} from "../src/FaunaDB.ts";

describe("remove_key(x, y)");

it("removes field from an object", function () {
  const actual = remove_key(
    "ts",
    {ref: Role("123").toString(), ts: 123, a: "hello", is_expr: true}
  );
  const exp = {ref: Role("123").toString(), a: "hello", is_expr: true};
  EQUALS(actual, exp);
}); // it function

it("removes field in every object of an array", function () {
  const arr = [
    {ts: 122434, ref: 123, name: "Role", args: ["hello"]},
    {ts: 354354, ref: 345, name: "Role", args: ["hello"]},
  ];
  const exp = [
    {ref: 123, name: "Role", args: ["hello"]},
    {ref: 345, name: "Role", args: ["hello"]},
  ];
  EQUALS(remove_key("ts", arr), exp);
}); // it function

it("does not remove field if object has no ref: field", function () {
  const o = {ts: 122434, name: "Role", args: ["hello"]};
  EQUALS(remove_key("ts", o), o);
}); // it function

// # =============================================================================
describe("standardize(x)");

it("returns an object that can be compared with other objects", function () {
  const x: Record<string, any> = {
    ref: Ref(Collection("ducks"), "duckman"),
    ts: 134343,
    name: "duckman",
    data: []
  };
  const y = Object.assign({}, x);
  delete y.ts;
  EQUALS(standardize(x), JSON.parse(JSON.stringify(y)));
}); // it function

// # =============================================================================
describe("equals(x, y)");

it("returns false if two FQL objects are different", () => {
  const actual = fql_equals(
    Role("123"),
    Role("234")
  );
  EQUALS(actual, false);
});

it("returns true if two FQL objects have the same values", function () {
  EQUALS(
    fql_equals(
      Role("123"),
      Role("123")
    ),
    true
  );
}); // it function

it("returns true if two FQL objects are equal except for a missing 'ts:' field", function () {
  const x = {
    ref: Collection("buck"),
    name: "banzoo"
  };
  const y = Object.assign({ts: 134536}, x);

  EQUALS(fql_equals(x, y), true);
}); // it function

it("returns true if two FQL objects are equal except for a missing 'gql:' field", function () {
  const x = {
    ref: Collection("buck"),
    name: "banzoo"
  };
  const y = Object.assign({gql: {}}, x);

  EQUALS(fql_equals(x, y), true);
}); // it function

