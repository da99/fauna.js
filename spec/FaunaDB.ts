import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import {
  diff, doc_compare, prune,
  Collection, Ref, Fn,
  Query, Lambda, Select,
  Create, Update, Delete,
  Role, Do
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
describe("doc_compare(old, new)");

it("returns false if old document has the same values as new doc.", function () {
  const old_d = old_collection("smiths");
  const new_d = new_collection("smiths");
  const actual = doc_compare(old_d, new_d);
  daEquals(actual, true);
}); // it function


// # =============================================================================
describe("diff(x, y)");

it("returns the Collections that need to be created", function () {
  const kittens = old_collection("kittens");
  const puppies = new_collection("puppies");
  const new_k = new_collection("kittens");

  const actual = diff([kittens], [new_k, puppies]);
  const expected = [
    Create(Ref("collections"), {name: "puppies", history_days: 0})
  ];

  daEquals(actual, expected);
}); // it function

it("returns the Functions that need to be created", function () {
  const old_f = {
    ref: Fn("hello1"),
    ts: 1645953999190000,
    name: "hello3",
    body: Query(Lambda("_", Select(1, [0, 1, 2])))
  };

  const new_f = {
    ref: Fn("hello2"),
    body: Query(Lambda("_", Select(1, [0, 1, 2])))
  };

  const actual = diff([old_f], [old_f, new_f]);
  const expected = [
    Create(Ref("functions"), {name: new_f.ref.id, body: new_f.body})
  ];

  daEquals(actual, expected);
}); // it function

it("skips documents that are a subset of existing documents", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const new_coll1 = new_collection("puppies");
  const new_coll2 = new_collection("kittens");

  const actual = diff([kittens, puppies], [new_coll1, new_coll2]);
  daEquals(actual, []);
}); // it function

it("returns Collections that need to be updated", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const new_k = new_collection("kittens");
  const new_p = new_collection("puppies");
  new_p.history_days = 1;

  const actual = diff([kittens, puppies], [new_k, new_p]);
  const expected = [
    Update(Collection("puppies"), {name: "puppies", history_days: 1})
  ];

  daEquals(actual, expected);
}); // it function

it("returns Functions that need to be updated", function () {
  const f = {
    ref: Fn("hello1"),
    ts: 1645953999190000,
    name: "hello1",
    body: Query(Lambda("_", Select(1, [0, 1, 2])))
  };
  const new_f = {
    ref: f.ref,
    body: Query(Lambda("_", Select(2, [0, 1, 2])))
  };
  const expected = [
    Update(new_f.ref, {
      body: new_f.body
    })
  ];
  daEquals(diff([f], [new_f]), expected);
}); // it function

it("returns the Collections that need to be deleted", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const actual = diff([kittens, puppies], []);
  const expected = [
    Delete(Collection("kittens")),
    Delete(Collection("puppies"))
  ];
  daEquals(actual, expected);
}); // it function

it("returns the Functions that need to be deleted", function () {
  const f = {
    ref: Fn("hello1"),
    ts: 1645953999190000,
    name: "hello1",
    body: Query(Lambda("_", Select(1, [0, 1, 2])))
  };

  const actual = diff([f], []);
  const expected = [
    Delete(Fn("hello1")),
  ];
  daEquals(actual, expected);
}); // it function

it("returns an empty array if nothing needs to be updated", function () {
  const f = {
    ref: Fn("hello1"),
    ts: 1645953999190000,
    name: "hello1",
    body: Query(Lambda("_", Select(1, [0, 1, 2])))
  };
  const c = {
    ref: Collection("kittens"),
    name: "kittens",
    history_days: 1
  };

  const actual = diff(
    [f, c],
    [
      {ref: f.ref, body: f.body} as Fn_Doc,
      {ref: c.ref, history_days: c.history_days} as Collection_Doc
    ]
  );
  daEquals(actual.length, 0);
}); // it function

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
    {ref: Collection("kittens"), history_days: 10}
  ] as New_Schema;

  const actual = prune(old_schema, new_schema);
  const expected = [
    Delete(Collection("dogs")),
    Delete(Fn("dog_walk"))
  ];
  daEquals(actual, expected);
}); // it function




