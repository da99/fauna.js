import { describe, it } from "../src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  diff,
  equals, Role, Ref,
  remove_key,
  standardize,
//   drop_schema, diff,schema, query,
  CreateCollection, Collection, Collections,
//   If, Exists,
//   delete_if_exists, collection_names
} from "../src/FaunaDB.ts";
// import type {Expr} from "../src/FaunaDB.ts";

function sample_collection(s: string) {
  return {
    ref: Collection(s), ts: 1644689714440000,
    history_days: 0, name: s
  };
}

// # =============================================================================
describe("diff(x, y)");

it("returns which documents need to be created", function () {
  const kittens = sample_collection("kittens");
  const puppies = sample_collection("puppies");

  const actual = diff([kittens], [kittens, puppies]);
  const expected = [
    CreateCollection({name: "puppies", history_days: 0})
  ];
  assertEquals(actual, expected);
}); // it function
