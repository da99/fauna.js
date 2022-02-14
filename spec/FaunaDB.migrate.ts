
import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import {
  drop_schema, diff,schema, query,
  Select, CreateCollection, Collection, Collections,
  If, Exists,
  delete_if_exists, collection_names
} from "../src/FaunaDB.ts";

import type {Expr} from "../src/FaunaDB.ts";

// # =============================================================================
// # === Helpers: ================================================================
// # =============================================================================
function random_name(s: string) {
  return `${s}_${Date.now()}`;
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

// # =============================================================================
describe("drop_schema()");

it("drops from the database: collections, roles, indexes, functions", async function () {
  await query(options, CreateCollection({name: random_name("coll")}));
  await query(options, drop_schema());
  const actual = await query(options, schema());
  daEquals(actual, []);
}); // it async



