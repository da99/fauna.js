
import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import {
  drop_schema, diff,schema, query, upsert,
  Select, CreateCollection, CreateFunction, Collection, Collections,
  Lambda,
  Do, If, Exists, Query, Fn,
  delete_if_exists, collection_names
} from "../src/FaunaDB.ts";

import type {Schema, Schema_Doc, New_Doc, Expr, Collection_Doc} from "../src/FaunaDB.ts";

// # =============================================================================
// # === Helpers: ================================================================
// # =============================================================================
function random_name(s: string) {
  return `${s}_${Date.now()}`;
} // function

function to_refs(x: Array<New_Doc | Schema_Doc>) {
  return x.map((x1: New_Doc | Schema_Doc) => x1.ref);
} // function

const options = {
  secret: Deno.env.get("FAUNA_SECRET_TEST_A") || ""
};

function remove(k: string) {
  return function (x: Record<string, any>) {
    const y = Object.assign({}, x);
    delete y[k];
    return y;
  };
} // function

function standardize_schema(x: Schema) {
  return x.map((s: Schema_Doc) => {
    if (s.ref && s.ref.name === "Collection") {
      const doc = s as Collection_Doc;
      return {"name": doc.name, "history_days": doc.history_days};
    }
    return s;
  });
} // function

// # =============================================================================
describe("query(...)");

it("executes the query", async function () {
  const expected = "c";
  const actual   = await query(options, Select(2, "a b c d e f".split(' ')));
  daEquals(actual, expected);
}); // it async

// # =============================================================================
describe("schema(...)");

it("retrieves schema from database", async () => {
    await query(options, drop_schema());
    const name = random_name("coll");
    const doc  = await query(
      options,
      CreateCollection({name, history_days: 0})
    );
    const standard_doc = {
      name,
      ref: doc.ref,
      history_days: doc.history_days,
    };
    const expected = [ standard_doc ];
    const actual   = await query(options, schema());

    daEquals(actual.map(remove("ts")), expected);
}); // it async

it("converts Function refs to Function(..) format", async function () {
    await query(options, drop_schema());
    const name = random_name("helloF");
    const doc  = {
      name,
      body: Query(
        Lambda(
          "_",
          Select(1, [0,1,2])
        )
      )
    };
    await query( options, CreateFunction(doc));
    const expected = [ {...doc, ref: Fn(name)} ];
    const actual   = await query(options, schema());

    daEquals(actual.map(remove("ts")), expected);
}); // it async

// # =============================================================================
// describe("drop_schema()");

// it("drops from the database: collections, roles, indexes, functions", async function () {
//   await query(options, CreateCollection({name: random_name("coll")}));
//   await query(options, drop_schema());
//   const actual = await query(options, schema());
//   daEquals(actual, []);
// }); // it async

// # =============================================================================
describe("do_upsert(...)");

it("executes new schema", async function () {
  // await query(options, drop_schema());
  const dogs = random_name("dogs");
  const kittens = random_name("kittens");
  const gimme1 = random_name("gimme1");
  const new_schema = [
    {
      ref: Collection(dogs),
      history_days: 3
    },
    {
      ref: Collection(kittens),
      history_days: 1
    },
    {
      ref: Fn(gimme1),
      body: Query(
        Lambda(
          "_",
          Select(1, [1,2,3])
        )
      )
    }
  ];
  const actual = await query(
    options,
    Do(upsert(new_schema))
  );
  daEquals(to_refs(actual), to_refs(new_schema));
}); // it async




