import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";

import {
  diff, doc_compare,
  Collection, Ref,
  Create, Update, Delete
} from "../src/FaunaDB.ts";

import type {
  Collection_Doc,
  New_Collection,
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

it("returns which documents need to be created", function () {
  const kittens = old_collection("kittens");
  const puppies = new_collection("puppies");
  const new_k = new_collection("kittens");

  const actual = diff([kittens], [new_k, puppies]);
  const expected = [
    Create(Ref("collections"), {name: "puppies", history_days: 0})
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

it("returns documents that need to be updated", function () {
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

it("returns documents that need to be deleted", function () {
  const kittens = old_collection("kittens");
  const puppies = old_collection("puppies");

  const actual = diff([kittens, puppies], []);
  const expected = [
    Delete(Collection("kittens")),
    Delete(Collection("puppies"))
  ];
  daEquals(actual, expected);
}); // it function

// it("returns Function documents that need to be created/updated/deleted", function () {
//   const old_schema = {
//     ref: Ref(Ref("functions"), "hello1"),
//     ts: 1645871589530000,
//     name: "hello1",
//     body: Query(Lambda("x", Add(Var("x"), Var("x"))))
//   };
// }); // it function

