import { describe, it } from "../src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  remove_key, standardize,
  Index, Role, Ref, CreateCollection, Collection, Collections,
} from "../src/FaunaDB.ts";
import type {Schema, FQL_Doc, Standard_Doc, Standard_Schema} from "../src/FaunaDB.ts";

describe("remove_key(x, y)");

it("removes field from an object", function () {
  const actual = remove_key(
    "ts",
    {ref: Role("123").toString(), ts: 123, a: "hello", is_expr: true}
  );
  const exp = {ref: Role("123").toString(), a: "hello", is_expr: true};
  assertEquals(actual, exp);
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
  assertEquals(remove_key("ts", arr), exp);
}); // it function

it("does not remove field if object has no ref: field", function () {
  const o = {ts: 122434, name: "Role", args: ["hello"]};
  assertEquals(remove_key("ts", o), o);
}); // it function

// # =============================================================================
describe("standardize(x)");

it("returns an object that can be compared with other objects", function () {
  const x: FQL_Doc = {
    ref: Ref(Collection("ducks"), "duckman"),
    ts: 134343,
    name: "duckman",
    data: []
  };
  const y = Object.assign({}, x);
  delete y.ts;
  assertEquals(standardize([x]), JSON.parse(JSON.stringify([y])));
}); // it function

it("removes the partition: field if record ref: refers to an Index", function () {
  const x: Schema = [{
    ref: Index("by_nickname"),
    ts: 1644689739380000,
    active: true,
    serialized: true,
    name: "by_nickname",
    unique: true,
    source: Collection("kittens"),
    terms: [ { field: ["data", "nickname"] } ],
    partitions: 1
  }];

  const actual = standardize(x) as Record<string, any>;
  assertEquals(actual.partitions, undefined);
}); // it function

// # =============================================================================
// describe("equals(x, y)");

// it("returns false if two FQL objects are different", () => {
//   const actual = equals(
//     Role("123"),
//     Role("234")
//   );
//   assertEquals(actual, false);
// });

// it("returns true if two FQL objects have the same values", function () {
//   assertEquals(
//     equals(
//       Role("123"),
//       Role("123")
//     ),
//     true
//   );
// }); // it function

// it("returns true if two FQL objects are equal except for a missing 'ts:' field", function () {
//   const x = {
//     ref: Collection("buck"),
//     name: "banzoo"
//   };
//   const y = Object.assign({ts: 134536}, x);

//   assertEquals(equals(x, y), true);
// }); // it function

// it("returns true if two FQL objects are equal except for a missing 'gql:' field", function () {
//   const x = {
//     ref: Collection("buck"),
//     name: "banzoo"
//   };
//   const y = Object.assign({gql: {}}, x);

//   assertEquals(equals(x, y), true);
// }); // it function

