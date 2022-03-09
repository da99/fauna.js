import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import {
  prune,
  Collection, Ref, Fn,
  Query, Lambda, Select,
  Create, Update, Delete,
  Role, Do,
  MigrateCollection
} from "../src/FaunaDB.ts";

import type {
  Collection_Doc, Fn_Doc, Schema, New_Schema
} from "../src/FaunaDB.ts";


function old_collection(s: string): Collection_Doc {
  return {
    ref: Collection(s),
    ts: 1644689714440000,
    name: s,
    history_days: 0,
  };
}

function new_collection(s: string): Collection_Doc {
  return {
    ref: Collection(s),
    name: s,
    history_days: 0,
  };
}

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
  const r = {name: "Role", collection: "roles", id: "123"};
  assertEquals(deepEqual(e, r), true);
}); // it function

// # =============================================================================
describe("prune(old_schema, new_schema)");

it("deletes records not found in new_schema", function () {
  const old_schema = [
    {ref: Collection("dogs"), name: "dogs", history_days: 1},
    {ref: Collection("kittens"), name: "kittens", history_days: 10},
    {ref: Fn("dog_walk"), body: Query(1)}
  ] as Schema;

  const new_schema = [
    MigrateCollection({name: "kittens", history_days: 10})
  ] as New_Schema;

  const actual = prune(old_schema, new_schema);
  const expected = [
    Delete(Collection("dogs")),
    Delete(Fn("dog_walk"))
  ];
  daEquals(actual, expected);
}); // it function




