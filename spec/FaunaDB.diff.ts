import { describe, it } from "../src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";
import {
  diff, doc_compare,
  CreateCollection, Collection, Update, Delete
} from "../src/FaunaDB.ts";
import type {
  Collection_Record,
  New_Collection,
  New_Doc
} from "../src/FaunaDB.ts";

function must_equal(x: any, y: any) {
  if (deepEqual(x, y))
    return true;
  return assertEquals(x,y);
}

function old_collection(s: string): Collection_Record {
  return {
    ref: Collection(s),
    ts: 1644689714440000,
    name: s,
    history_days: 0,
  };
}

function new_collection(s: string): New_Doc {
  return {
    coll: "Collection",
    doc: {
      name: s,
      history_days: 0,
    }
  };
}

// # =============================================================================
describe("doc_compare(old, new)");

it("returns false if old document has the same values as new doc.", function () {
  const old_d = old_collection("smiths");
  const new_d = new_collection("smiths");
  const actual = doc_compare(old_d, new_d);
  assertEquals(actual, true);
}); // it function


// # =============================================================================
describe("diff(x, y)");

it("returns which documents need to be created", function () {
  const kittens = old_collection("kittens");
  const puppies = new_collection("puppies");
  const new_k = new_collection("kittens");

  const actual = diff([kittens], [new_k, puppies]);
  const expected = [
    CreateCollection({name: "puppies", history_days: 0})
  ];
  must_equal(actual, expected);
}); // it function

it("skips documents that are a subset of existing documents", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");
  const new_coll1 = new_collection("puppies");
  const new_coll2 = new_collection("kittens");

  const actual = diff([kittens, puppies], [new_coll1, new_coll2]);
  assertEquals(actual, []);
}); // it function

it("returns documents that need to be updated", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const new_k = new_collection("kittens");
  const new_p = new_collection("puppies");
  (new_p.doc as New_Collection).history_days = 1;

  const actual = diff([kittens, puppies], [new_k, new_p]);
  const expected = [
    Update(Collection("puppies"), {name: "puppies", history_days: 1})
  ];
  must_equal(actual, expected);
}); // it function

it("returns documents that need to be deleted", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const actual = diff([kittens, puppies], []);
  const expected = [
    Delete(Collection("kittens")),
    Delete(Collection("puppies"))
  ];
  must_equal(actual, expected);
}); // it function

